document.addEventListener("DOMContentLoaded", async function () {
    const titleInput = document.getElementById("title");
    const contentInput = document.getElementById("content");
    const submitButton = document.querySelector(".submitButton");
    const errorText = document.getElementById("errorMessage");
    const fileInput = document.getElementById("fileInput");

    const userInfo = await loadUserInfo();

    // 제목과 내용이 모두 입력될 때 버튼 색상 변경 및 활성화
    function toggleButtonState() {
        if (titleInput.value.trim() !== "" && contentInput.value.trim() !== "") {
            submitButton.classList.remove("disabled"); // CSS 클래스 변경
            submitButton.disabled = false;
        } else {
            submitButton.classList.add("disabled"); // 비활성화 클래스 추가
            submitButton.disabled = true;
        }
    }

    // 입력 필드에 이벤트 리스너 추가
    titleInput.addEventListener("input", toggleButtonState);
    contentInput.addEventListener("input", toggleButtonState);

    // 이미지 업로드 함수
    async function uploadImage() {
        if (fileInput.files.length === 0) return null; // 이미지가 선택되지 않으면 null 반환

        const formData = new FormData();
        formData.append('image', fileInput.files[0]);

        try {
            const response = await fetch("http://0.0.0.0:2000/upLoadProfile", {
                method: "POST",
                body: formData,
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("이미지 업로드 실패");
            }

            const data = await response.json();
            return data.imageUrl; // 업로드된 이미지 URL 반환
        } catch (error) {
            console.error("이미지 업로드 오류:", error);
            alert("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
            return null; // 실패 시 null 반환
        }
    }

    // 게시글 작성 요청 함수
    async function submitPost() {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        let imageUrl = await uploadImage(); // 이미지 URL을 가져옴

        // 이미지가 업로드되지 않은 경우 기본 이미지 사용
        if (!imageUrl) {
            imageUrl = "../images/sample.jpeg"; // 기본 이미지 URL 설정
        }

        const newPost = {
            userId: userInfo.userId,
            title: title,
            content: content,
            imageUrl: imageUrl,
        };

        try {
            const response = await fetch("http://0.0.0.0:3000/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPost),
                credentials: 'include' // 세션 쿠키 포함
            });

            const data = await response.json();

            if (response.ok) {
                console.log(data.message);
                window.location.href = "/posts"; // 게시글 작성 완료 후 목록 페이지로 이동
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
