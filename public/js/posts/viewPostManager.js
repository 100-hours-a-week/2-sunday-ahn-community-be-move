document.addEventListener("DOMContentLoaded", async () => {
    const loadingScreen = document.getElementById("loadingScreen"); // 로딩 화면 엘리먼트
    // 로딩 화면 표시
    loadingScreen.style.display = "flex";

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

    const userInfo = await loadUserInfo();

    // 페이지가 로드될 때 특정 게시글의 데이터를 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('postId');

    // 댓글 관련 요소
    const commentsContainer = document.getElementById("commentsContainer");

    // 게시물 삭제 버튼
    const deletePostBtn = document.getElementById("deletePostBtn");
    if (deletePostBtn) {
        deletePostBtn.addEventListener("click", isDeletePost);
    }

    // 게시글 수정 버튼
    const editPostBtn = document.getElementById("editPostBtn");
    if (editPostBtn) {
        editPostBtn.addEventListener("click", () => {
            window.location.href = `/editPost?postId=${postId}`;
        });
    }

    // 게시글 상세조회
    const fetchPostDetails = async (postId) => {
        try {
            const response = await fetch(`http://3.36.118.177:3000/posts/${postId}`, {
                method: 'GET',
                credentials: 'include' // 세션 쿠키를 포함시킴
            });

            if (!response.ok) {
                throw new Error(`게시글을 불러오는 데 실패했습니다. 상태 코드: ${response.status}`);
            }

            const data = await response.json();
            const postData = data.data;

            // 게시글 정보 표시
            postTitle.innerHTML = `<strong>${postData.title}</strong>`;
            postContent.innerHTML = postData.content;
            postLikes.innerHTML = postData.likes;
            postViews.innerHTML = postData.views;
            postComments.innerHTML = postData.commentsCnt;
            postDate.innerHTML = formatDateToCustomFormat(postData.date);
            authorImage.src = postData.author.profileImg;
            postAuthor.innerHTML = postData.author.nickname;
            postImage.src = postData.imageUrl || '../images/sample.jpeg';

            // 댓글 수 갱신 및 댓글 표시
            updateCommentCount(postData.commentsCnt);
            displayComments(postData.comments);

        } catch (error) {
            console.error(error);
            alert(`게시글을 불러오는 중 오류가 발생했습니다. ${error.message}`);
        }finally {
            // 로딩 화면 숨기기
            loadingScreen.style.display = "none";
        }
    }
    
    // 댓글 표시 함수
    const displayComments = (comments) => {
        commentsContainer.innerHTML = "";
        comments.forEach(comment => {
            const commentElement = document.createElement("div");
            commentElement.classList.add("comment");

            // 댓글 데이터 속성 추가
            commentElement.dataset.commentId = comment.commentId;
            commentElement.dataset.postId = comment.postId;
            commentElement.dataset.userId = comment.author.userId;

            // 댓글 내용 HTML 구성
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
                        <p>${formatDateToCustomFormat(comment.date)}</p>
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
const isDeletePost = () => {
    document.getElementById("modalOverlay").style.display = "flex";
}

// 모달 닫기
const closeModal = () => {
    document.getElementById("modalOverlay").style.display = "none";
}

// 게시글 삭제 확인
const confirmDelete = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('postId');

    if (!postId) {
        alert("잘못된 게시글 ID입니다.");
        closeModal();
        return;
    }

    // 백엔드로 삭제 요청 보내기
    fetch(`http://3.36.118.177:3000/posts/${postId}`, {
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
            window.location.href = "/posts"; // 메인 페이지로 이동
        } else {
            console.log("삭제에 실패했습니다. 다시 시도해주세요.");
        }
    })
    .catch(error => {
        console.error(error);
        alert(`게시글을 삭제하는 중 오류가 발생했습니다: ${error.message}`);
    });
}

// 좋아요 클릭
const toggleLike = async () => {
    const postId = new URLSearchParams(window.location.search).get('postId'); // postId 가져오기
    const postLikes = document.getElementById("likesCount");

    try {
        const response = await fetch(`http://3.36.118.177:3000/posts/${postId}/likes`, {
            method: 'GET',
            credentials: 'include'
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || '좋아요 처리 중 오류가 발생했습니다.');
        }

        postLikes.innerText = parseInt(postLikes.innerText) + 1;  // 기존 좋아요 수에 1 추가

    } catch (error) {
        console.error(error);
        alert(`좋아요 처리 중 오류가 발생했습니다. ${error.message}`);
    }
};