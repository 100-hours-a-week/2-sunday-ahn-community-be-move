document.addEventListener("DOMContentLoaded", async function () {
    const titleInput = document.getElementById("title");
    const contentInput = document.getElementById("content");
    const submitButton = document.querySelector(".submitButton");
    const errorText = document.getElementById("errorMessage");

    const userInfo = await loadUserInfo();

    // 제목과 내용이 모두 입력될 때 버튼 색상 변경 및 활성화
    function toggleButtonState() {
        if (titleInput.value.trim() !== "" && contentInput.value.trim() !== "") {
            submitButton.style.backgroundColor = "#7F6AEE"; // 활성화 색상
            submitButton.disabled = false;
        } else {
            submitButton.style.backgroundColor = "#ACA0EB"; // 비활성화 색상
            submitButton.disabled = true;
        }
    }

    // 입력 필드에 이벤트 리스너 추가
    titleInput.addEventListener("input", toggleButtonState);
    contentInput.addEventListener("input", toggleButtonState);

    //이미지 업로드 함수
    async function uploadImage() {
        if (fileInput.files.length === 0) return null;

        const formData = new FormData();
        formData.append('image', fileInput.files[0]);

        try {
            const response = await fetch("http://localhost:2000/upLoadProfile", {
                method: "POST",
                body: formData,
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("이미지 업로드 실패");
            }

            const data = await response.json();
            return data.imageUrl;
        } catch (error) {
            console.error("이미지 업로드 오류:", error);
            alert("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
            return null;
        }
    }
    // 게시글 작성 요청 함수
    async function submitPost() {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const date = formatDateToCustomFormat(new Date()); 
        
        const imageUrl = await uploadImage();

        const newPost = {
            userId: userInfo.userId,
            title: title,
            content: content,
            date: date,
            imageUrl: imageUrl,
        };

        try {
            const response = await fetch("http://localhost:3000/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPost),
                credentials: 'include' // 세션 쿠키를 포함시킴
            });

            const data = await response.json();

            if (response.ok) {
                console.log(data.message);
                window.location.href = "/posts"; // 작성 완료 시 페이지 이동
            } else {
                console.error("게시글 작성 실패:", data.message);
                errorText.innerText = "*서버에 오류가 발생했습니다. 다시 시도해주세요.";
                errorText.style.visibility = "visible";
            }
        } catch (error) {
            console.error("게시글 작성 중 오류 발생:", error);
            errorText.innerText = "*서버에 오류가 발생했습니다. 다시 시도해주세요.";
            errorText.style.visibility = "visible";
        }
    }

    // 버튼 클릭 시 입력 확인 및 게시글 작성 요청
    submitButton.addEventListener("click", function (event) {
        if (titleInput.value.trim() === "" || contentInput.value.trim() === "") {
            event.preventDefault(); // 기본 동작 방지
            errorText.innerText = "*제목, 내용을 모두 작성해주세요";
            errorText.style.visibility = "visible";
        } else {
            errorText.style.visibility = "hidden";
            submitPost(); // 게시글 작성 함수 호출
        }
    });
});