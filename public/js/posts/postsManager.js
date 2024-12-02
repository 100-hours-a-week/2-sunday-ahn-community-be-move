document.addEventListener("DOMContentLoaded", async () => {
    const postBtn = document.getElementById("postBtn");
    const postsContainer = document.querySelector(".postList");

    const loadingScreen = document.getElementById("loadingScreen"); // 로딩 화면 엘리먼트
    // 로딩 화면 표시
    loadingScreen.style.display = "flex";
    
    const userInfo = await loadUserInfo();

    // 게시물 작성 버튼
    postBtn.addEventListener("click", () => {
        if (!userInfo) {
            alert("로그인 후 게시물을 작성할 수 있습니다.");
            return;
        }
        window.location.href = "./writePost"; // 게시물 작성 페이지로 이동
    });

    // 게시글 목록 불러오기
    const loadPostList = async () => {
        try {
            const response = await fetch(`http://3.36.118.177:3000/api/posts`, {
                method: "GET",
                credentials: "include", // 세션 쿠키를 포함시킴
            });

            if (!response.ok) throw new Error("게시글 목록을 불러오는 데 실패했습니다.");

            const { data: postList } = await response.json();
            postsContainer.innerHTML = "";

            if (postList && postList.length > 0) {
                postList.forEach((post) => postsContainer.appendChild(createPostElement(post)));
            } else {
                postsContainer.innerHTML = '<p>게시글이 없습니다.</p>';
            }
        } catch (error) {
            console.error("게시글 목록을 불러오는 중 오류 발생:", error);
        }finally {
            // 로딩 화면 숨기기
            loadingScreen.style.display = "none";
        }
    };

    // 게시글 엘리먼트 생성
    const createPostElement = (post) => {
        const postElement = document.createElement("div");
        postElement.classList.add("post");

        postElement.innerHTML = `
            <div class="title">
                <div class="titleTxt">
                    <p><strong>${post.title}</strong></p>
                </div>
                <div class="postElement">
                    <div class="ele1">
                        <p id="likes">좋아요 ${post.likes || 0}</p>
                        <p id="comments">댓글 ${post.commentsCnt || 0}</p>
                        <p id="views">조회수 ${post.views || 0}</p>
                    </div>
                    <p id="date">${formatDateToCustomFormat(post.date)}</p>
                </div>
            </div>
            <div class="user">
                <div class="profileContainer">
                    <div class="box" id="author" style="background: #BDBDBD;">
                        <img class="profile" src="${post.author.profileImg}" alt="${post.author.nickname}의 프로필">
                    </div>
                </div>
                <div class="nickname">
                    <p id="userTxt">${post.author.nickname}</p>
                </div>
            </div>
        `;

        postElement.addEventListener("click", () => {
            window.location.href = `/viewPost?postId=${post.postId}`;
        });

        return postElement;
    };

    // 게시글 목록 불러오기 실행
    await loadPostList();
});
