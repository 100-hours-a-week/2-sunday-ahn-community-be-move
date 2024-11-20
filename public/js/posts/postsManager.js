document.addEventListener("DOMContentLoaded", async function () {
    const postBtn = document.getElementById("postBtn");
    const postsContainer = document.querySelector('.postList');

    const userInfo = await loadUserInfo();

    // 게시물 작성 버튼
    postBtn.addEventListener("click", function () {
        if (!userInfo) {
            alert("로그인 후 게시물을 작성할 수 있습니다.");
            return;
        }
        window.location.href = "./writePost";  // 게시물 작성 페이지로 이동
    });

    // 게시글 목록 불러오기
    async function loadPostList() {
        try {
            const response = await fetch('http://localhost:3000/posts', {
                method: 'GET',
                credentials: 'include' // 세션 쿠키를 포함시킴
            });
    
            if (!response.ok) {
                throw new Error('게시글 목록을 불러오는 데 실패했습니다.');
            }
            
            const result = await response.json();

            if (response.ok && result.data) {
                const postList = result.data;

                postsContainer.innerHTML = '';

                if (postList.length > 0) {
                    postList.forEach(post => {
                        const postElement = document.createElement('div');
                        postElement.classList.add('post');
                        
                        const postTitle = document.createElement('div');
                        postTitle.classList.add('title');
                        postTitle.innerHTML = `
                            <div class="titleTxt">
                                <p><strong>${post.title}</strong></p>
                            </div>
                            <div class="postElement">
                                <div class="ele1">
                                    <p id="likes">좋아요 ${post.likes || 0}</p>
                                    <p id="comments">댓글 ${post.commentsCnt || 0}</p>
                                    <p id="views">조회수 ${post.views || 0}</p>
                                </div>
                                <p id="date">${post.date}</p>
                            </div>
                        `;

                        const postAuthor = document.createElement('div');
                        postAuthor.classList.add('user');
                        postAuthor.innerHTML = `
                            <div class="profileContainer">
                                <div class="box" id="author" style="background: #BDBDBD;">
                                    <img class="profile" src="${post.author.profileImg}" alt="${post.author.nickname}의 프로필">
                                </div>
                            </div>
                            <div class="nickname">
                                <p id="userTxt">${post.author.nickname}</p>
                            </div>
                        `;

                        postElement.appendChild(postTitle);
                        postElement.appendChild(postAuthor);

                        postsContainer.appendChild(postElement);

                        postElement.addEventListener("click", function () {
                            window.location.href = `/viewPost?postId=${post.postId}`;
                        });
                    });
                } else {
                    postsContainer.innerHTML = '<p>게시글이 없습니다.</p>';
                }
            }
        } catch (error) {
            console.error("게시글 목록을 불러오는 중 오류 발생:", error);
            alert("*서버에 연결할 수 없습니다.");
        }
    }
    await loadPostList();
});
