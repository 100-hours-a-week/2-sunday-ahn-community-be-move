document.addEventListener("DOMContentLoaded", async function() {
    // 게시글 정보 표시 요소
    const postTitle = document.getElementById("postTitle");
    const postContent = document.getElementById("postContent");
    const postLikes = document.getElementById("likesCount");
    const postViews = document.getElementById("viewsCount");
    const postComments = document.getElementById("commentsCount");
    const postDate = document.getElementById("postDate");
    const postAuthor = document.getElementById("userNickname");
    const postImage = document.getElementById("postImage");
    const authorImage = document.getElementById("authorProfileImage");
    
    const  userInfo = await loadUserInfo();
    
    // 페이지가 로드될 때 특정 게시글의 데이터를 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('postId');

    // 댓글 관련 요소
    const commentsContainer = document.getElementById("commentsContainer");

    //게시물 삭제 버튼
    const deletePostBtn = document.getElementById("deletePostBtn");
    if (deletePostBtn) {
        deletePostBtn.addEventListener("click", isDeletePost);
    }

    //게시글 수정 버튼
    const editPostBtn = document.getElementById("editPostBtn");
    if (editPostBtn) {
        editPostBtn.addEventListener("click", function() {
            window.location.href = `/editPost?postId=${postId}`;
        });
    }
    
    // 게시글 상세조회
    async function fetchPostDetails(postId) {
        try {
            const response = await fetch(`http://localhost:3000/posts/${postId}`,{
                method: 'GET',
                credentials: 'include' // 세션 쿠키를 포함시킴
            });
            if (!response.ok) {
                throw new Error(`게시글을 불러오는 데 실패했습니다. 상태 코드: ${response.status}`);
            }

            const data = await response.json();
            const postData = data.data;
            postTitle.innerHTML = `<strong>${postData.title}</strong>`;
            postContent.innerHTML = postData.content;
            postLikes.innerHTML = postData.likes;
            postViews.innerHTML = postData.views;
            postComments.innerHTML = postData.commentsCnt;  // 댓글 수 표시
            postDate.innerHTML = postData.date;
            authorImage.src = postData.author.profileImg;
            postAuthor.innerHTML = postData.author.nickname;
            postImage.src = postData.imageUrl;

            // 댓글 수를 갱신
            updateCommentCount(postData.commentsCnt);

            displayComments(postData.comments);
        } catch (error) {
            console.error(error);
            alert(`게시글을 불러오는 중 오류가 발생했습니다. ${error.message}`);
        }
    }

    // 댓글
    function displayComments(comments) {
        commentsContainer.innerHTML = "";
        comments.forEach(comment => {
            const commentElement = document.createElement("div");
            commentElement.classList.add("comment");
            
            // 각 댓글에 필요한 데이터 속성 추가
            commentElement.dataset.commentId = comment.commentId;
            commentElement.dataset.postId = comment.postId;
            commentElement.dataset.userId = comment.author.userId;
    
            commentElement.innerHTML = `
                <div class="profileSection">
                    <div class="normalProfile">
                        <div class="box" style="background: #BDBDBD;">
                            <img class="profile" src="${comment.author.profileImg}">
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
        });
        updateCommentCount();
    }
    

    if (postId) {
        fetchPostDetails(postId);
    } else {
        alert("잘못된 게시글 ID입니다.");
    }
});

// 게시글 삭제 로직
function isDeletePost() {
    document.getElementById("modalOverlay").style.display = "flex";
}

// 모달 닫기
function closeModal() {
    document.getElementById("modalOverlay").style.display = "none";
}

// 게시글 삭제 확인
function confirmDelete() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('postId');
    
    if (!postId) {
        alert("잘못된 게시글 ID입니다.");
        closeModal();
        return;
    }
    
    // 백엔드로 삭제 요청 보내기
    fetch(`http://localhost:3000/posts/${postId}`, {
        method: "DELETE",
        credentials: 'include' // 세션 쿠키를 포함시킴
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("서버에 오류가 발생했습니다.");
        }
        return response.json();
    })
    .then(data => {
        if (data.message === "게시물 삭제 성공") {
            console.log("게시글 삭제가 완료되었습니다.");
            closeModal();
            window.location.href = "/posts"; // 메인 페이지로 이동하거나 원하는 페이지로 리디렉션
        } else {
            console.log("삭제에 실패했습니다. 다시 시도해주세요.");
        }
    })
    .catch(error => {
        console.error(error);
        alert(`게시글을 삭제하는 중 오류가 발생했습니다: ${error.message}`);
    });
}
