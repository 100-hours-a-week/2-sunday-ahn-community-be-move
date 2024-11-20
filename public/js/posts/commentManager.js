// 댓글 수정 중인 댓글을 기억하기 위한 변수
let currentEditingComment = null;

// 모달 열기 함수 (삭제 확인 모달)
function isDeleteComment(commentElement) {
    currentEditingComment = commentElement;
    document.getElementById("modalOverlay2").style.display = "flex";
}

// 모달 닫기 함수 (삭제 확인 모달)
function closeModal2() {
    document.getElementById("modalOverlay2").style.display = "none";
}

// 댓글 삭제 확인 함수
async function confirmDelete2() {
    if (!currentEditingComment) {
        console.error("삭제할 댓글이 선택되지 않았습니다.");
        return;
    }

    const commentId = currentEditingComment.dataset.commentId;
    try {
        const response = await fetch(`http://localhost:3000/comments/${commentId}`, { 
            method: "DELETE",
            credentials: 'include' // 세션 쿠키를 포함시킴
        });
        if (!response.ok) throw new Error("서버에 오류가 발생했습니다.");

        const data = await response.json();
        console.log(data.message);

        currentEditingComment.remove();
        updateCommentCount();
    } catch (error) {
        console.error("댓글 삭제 중 오류 발생:", error);
    }

    closeModal2();
}

// 댓글 수정 함수
function editComment(commentElement) {
    currentEditingComment = commentElement;

    const commentText = commentElement.querySelector('.commentContents p').innerText;
    document.getElementById('inputComment').value = commentText;

    const submitButton = document.querySelector('.commentBtn');
    submitButton.value = '댓글 수정';
    submitButton.setAttribute('onclick', 'updateComment()');
    toggleSubmitButton();  // 버튼 활성화 상태 갱신
}

// 댓글 수정 완료 함수
async function updateComment() {
    const updatedText = document.getElementById('inputComment').value;
    if (!currentEditingComment) return;

    currentEditingComment.querySelector('.commentContents p').innerText = updatedText;

    const commentId = currentEditingComment.dataset.commentId;
    const postId = currentEditingComment.dataset.postId;
    const userId = currentEditingComment.dataset.userId;
    const editDate = formatDateToCustomFormat(new Date());

    const updatedComment = {
        userId: userId,
        postId: postId,
        newComment: updatedText,
        date: editDate,
    };

    try {
        const response = await fetch(`http://localhost:3000/comments/${commentId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedComment),
            credentials: 'include' // 세션 쿠키를 포함시킴
        });

        if (!response.ok) throw new Error("댓글 수정 실패");

        const data = await response.json();
        console.log(data.message);
    } catch (error) {
        console.error("댓글 수정 중 오류 발생:", error);
    }

    document.getElementById('inputComment').value = '';
    const submitButton = document.querySelector('.commentBtn');
    submitButton.value = '댓글 등록';
    submitButton.setAttribute('onclick', 'addComment()');

    currentEditingComment = null;
    toggleSubmitButton();  // 버튼 비활성화 상태로 설정
}

// 새로운 댓글 추가 함수
async function addComment() {
    const commentText = document.getElementById('inputComment').value;
    if (commentText === "") {
        alert("댓글을 입력해 주세요.");
        return;
    }

    const postId = parseInt(new URLSearchParams(window.location.search).get('postId'));
    
    //여기서 안받아와짐 undefined
    const userId = (await loadUserInfo()).userId;

    const newComment = {
        userId: userId,
        postId: postId,
        content: commentText,
        date: formatDateToCustomFormat(new Date())
    };

    try {
        const response = await fetch('http://localhost:3000/comments', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newComment),
            credentials: 'include' // 세션 쿠키를 포함시킴
        });

        if (!response.ok) throw new Error("댓글 등록에 실패했습니다.");

        const data = await response.json();
        if (data.message === "댓글 등록 성공") {
            const comment = {
                commentId: data.data.commentId,
                postId: data.data.postId,
                content: data.data.content,
                author: {
                    userId: data.data.userId,
                    nickname: data.data.author.nickname,
                    profileImage: data.data.author.profileImage
                },
                date: formatDateToCustomFormat(new Date())
            };

            appendCommentToDOM(comment);
            document.getElementById('inputComment').value = '';
            updateCommentCount();
        } else {
            alert("댓글 등록에 실패했습니다. 다시 시도해주세요.");
        }
    } catch (error) {
        console.error(error);
        alert(error.message);
    }

    toggleSubmitButton();  // 버튼 비활성화 상태로 설정
}

// 댓글 수 갱신 함수
function updateCommentCount() {
    const commentsContainer = document.getElementById("commentsContainer");
    const commentCount = commentsContainer.children.length;
    const commentCountElement = document.getElementById("commentsCount");
    if (commentCountElement) {
        commentCountElement.innerText = commentCount;
    }
}

// 서버에서 받은 댓글을 DOM에 추가하는 함수
function appendCommentToDOM(comment) {
    const commentsContainer = document.getElementById("commentsContainer");

    const commentElement = document.createElement("div");
    commentElement.classList.add("comment");
    commentElement.dataset.commentId = comment.commentId;
    commentElement.dataset.postId = comment.postId;
    commentElement.dataset.userId = comment.userId;

    commentElement.innerHTML = `
        <div class="profileSection">
            <div class="normalProfile">
                <div class="box" style="background: #BDBDBD;">
                    <img class="profile" src="${comment.author.profileImage}">
                </div>
            </div>
        </div>
        <div class="userInfo2">
            <div class="author">
                <p>${comment.author.nickname}</p>
                <p>${comment.date}</p>
            </div>
            <div class="commentContents">
                <p>${comment.content}</p>
            </div>
        </div>
        <div class="edit">
            <div class="bnt">
                <div class="commentEditBtn" onclick="editComment(this.closest('.comment'))">
                    <p><strong>수정</strong></p>
                </div>
            </div>
            <div class="bnt" onclick="isDeleteComment(this.closest('.comment'))">
                <div class="commentEditBtn">
                    <p><strong>삭제</strong></p>
                </div>
            </div>
        </div>
    `;

    commentsContainer.appendChild(commentElement);
    updateCommentCount();
}

// 댓글 입력란 변경에 따른 버튼 활성화/비활성화
function toggleSubmitButton() {
    const commentText = document.getElementById('inputComment').value;
    const submitButton = document.querySelector('.commentBtn');
    if (commentText.trim() === "") {
        submitButton.style.backgroundColor = "#ACA0EB";  // 비활성화 색상
        submitButton.disabled = true;
    } else {
        submitButton.style.backgroundColor = "#7F6AEE";  // 활성화 색상
        submitButton.disabled = false;
    }
}

// 댓글 입력란의 값이 변경될 때마다 버튼 상태 업데이트
document.getElementById('inputComment').addEventListener('input', toggleSubmitButton);
