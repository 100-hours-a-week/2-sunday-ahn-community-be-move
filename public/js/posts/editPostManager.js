document.addEventListener("DOMContentLoaded", async function() {
    const userInfo = await loadUserInfo();
    // 게시물 정보 가져오기
    try {
        const response = await fetch(`http://localhost:3000/posts/${postId}`,{
            method: "GET",
            credentials: 'include' // 세션 쿠키를 포함시킴
        });
        if (!response.ok) {
            throw new Error("게시물을 불러오는 데 실패했습니다.잉~");
        }
        const data = await response.json();
        const post = data.data;
        // 서버에서 반환된 post 객체가 비어있는지 확인
        if (!post || !post.title || !post.content) {
            throw new Error("게시물 정보가 올바르지 않습니다.");
        }

        // 폼에 기존 게시물 정보 채우기
        titleInput.value = post.title || "";  // title이 없으면 빈 문자열로 설정
        contentInput.value = post.content || "";  // content가 없으면 빈 문자열로 설정

        // 기존 이미지 URL 설정
        if (post.imageUrl) {
            document.getElementById("profileImage").src = userInfo.profileImage;
            existingImageUrl = post.imageUrl;  // 기존 이미지 URL 저장
        } else {
            existingImageUrl = null;  // 기존 이미지가 없으면 null로 설정
        }
    } catch (error) {
        console.error("게시물 정보 불러오기 오류:", error);
        alert("게시물 정보를 불러오는 데 실패했습니다.");
    }
});

const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('postId');
const submitButton = document.querySelector(".submitButton");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const errorText = document.getElementById("errorMessage");
const fileInput = document.getElementById("fileInput");

let existingImageUrl = null; // 기존 이미지 URL을 저장하는 변수

// 이미지 업로드 처리 함수
async function uploadImage() {
    const formData = new FormData();
    formData.append('image', fileInput.files[0]); // 파일 선택 시 첫 번째 파일 사용

    try {
        const response = await fetch(`http://localhost:2000/upLoadProfile`, {
            method: "POST",
            body: formData,
            credentials: 'include' // 세션 쿠키를 포함시킴
        });

        if (!response.ok) {
            throw new Error("이미지 업로드 실패");
        }

        const data = await response.json();
        return data.imageUrl; // 업로드된 이미지 URL 반환
    } catch (error) {
        console.error("이미지 업로드 중 오류 발생:", error);
        alert("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
        return null;
    }
}

// 게시글 수정 처리
submitButton.addEventListener("click", async function (event) {
    event.preventDefault();
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    // 입력 유효성 검사
    if (title === "" || content === "") {
        errorText.innerText = "*제목, 내용을 모두 작성해주세요";
        errorText.style.visibility = "visible";
        return;
    } else {
        errorText.style.visibility = "hidden";
    }

    // 이미지 업로드 및 URL 가져오기
    let imageUrl = null;
    if (fileInput.files.length > 0) {
        imageUrl = await uploadImage();  // 이미지 URL을 가져오거나 null을 반환
        if (!imageUrl) return; // 이미지 업로드 실패 시 종료
    } else {
        // 이미지가 변경되지 않으면 기존 이미지 URL을 그대로 사용
        imageUrl = existingImageUrl;  // 기존 이미지 URL
    }

    // 수정 요청 데이터 생성
    const postData = {
        newTitle: title,
        newContent: content,
        editDate: formatDateToCustomFormat(new Date()),
        imageUrl: imageUrl, // 이미지 URL 포함
    };

    // 수정 요청 보내기
    try {
        const response = await fetch(`http://localhost:3000/posts/${postId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
            credentials: 'include' // 세션 쿠키를 포함시킴
        });

        if (!response.ok) {
            throw new Error("게시물 수정 실패");
        }

        const data = await response.json();
        alert("게시물이 성공적으로 수정되었습니다.");
        window.location.href = `/viewPost?postId=${postId}`; // 수정 후 상세 페이지로 이동
    } catch (error) {
        console.error("게시물 수정 중 오류 발생:", error);
        alert("게시물 수정에 실패했습니다.");
    }
});
