// 토스트 메시지 표시 함수
function showToast() {
    const toast = document.querySelector(".finish");
    if (toast) {
        toast.style.visibility = "visible";
        toast.style.opacity = 0.9;
        setTimeout(function () {
            toast.style.opacity = 0;
            setTimeout(function () {
                toast.style.visibility = "hidden";
            }, 300);
        }, 1000);
    }
}

// 모달 열기 함수
function openModal() {
    const modalOverlay = document.getElementById("modalOverlay");
    if (modalOverlay) {
        modalOverlay.style.display = "flex";
    }
}

// 모달 닫기 함수
function closeModal() {
    const modalOverlay = document.getElementById("modalOverlay");
    if (modalOverlay) {
        modalOverlay.style.display = "none";
    }
}
// 회원 탈퇴 함수
async function confirmDelete() {
    const userInfo = await loadUserInfo(); // 로컬에서 사용자 정보 가져오기

    try {
        const response = await fetch(`http://localhost:3000/users/withdraw/${userInfo.userId}`, {
            method: "DELETE",
            credentials: "include" // 세션 쿠키 포함
        });

        if (response.ok) {
            alert("회원 탈퇴가 완료되었습니다.");
            sessionStorage.removeItem("user"); // 클라이언트 세션 초기화
            window.location.href = "/login"; // 로그인 페이지로 이동
        } else {
            const error = await response.json();
            alert("회원 탈퇴 실패: " + error.message);
        }
    } catch (error) {
        alert("네트워크 오류 발생: " + error.message);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const fileInput = document.getElementById("fileInput");
    const profileImagePreview = document.getElementById("profileImagePreview");
    const editProfileButton = document.getElementById("editProfile");
    const nicknameInput = document.getElementById("nickname");
    const submitButton = document.querySelector(".submitButton");
    const emailTxt = document.getElementById("email");

    let userInfo = await loadUserInfo();

    // 초기 사용자 정보 로드
    nicknameInput.placeholder = userInfo.nickname;
    profileImagePreview.src = userInfo.profileImage;
    // profileImage.src = userInfo.profileImage;
    emailTxt.textContent = userInfo.email;
    let uploadedProfileImageUrl = userInfo.profileImage; // 기존 프로필 이미지 URL 초기화

    // 프로필 변경 버튼 클릭 시 파일 선택 창 열기
    editProfileButton.addEventListener("click", () => fileInput.click());

    // 파일 선택 후 미리보기
    fileInput.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();

            // 파일 읽기가 완료되면 미리보기 업데이트
            reader.onload = function (e) {
                const imageUrl = e.target.result;
                profileImagePreview.src = imageUrl;
                profileImagePreview.style.display = "block";
            };

            reader.readAsDataURL(file);
        }
    });

    // 수정하기 버튼 클릭 시 프로필 이미지 및 닉네임 저장
    submitButton.addEventListener("click", async (event) => {
        event.preventDefault();

        const nickname = nicknameInput.value.trim();
        const errorElement = document.getElementById("nicknameError");
        let hasError = false;

        // 에러 메시지 초기화
        errorElement.textContent = "";
        errorElement.style.visibility = "hidden";

        try {
            // 닉네임이 입력된 경우 유효성 검사
            if (nickname && nickname !== userInfo.nickname) {
                if (nickname.length > 10) {
                    errorElement.textContent = "*닉네임은 최대 10자 까지 작성 가능합니다.";
                    errorElement.style.visibility = "visible";
                    hasError = true;
                } else {
                    // 닉네임 업데이트 요청
                    const nicknameResponse = await fetch(`http://localhost:3000/users/nickname/${userInfo.userId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ newNickname: nickname }),
                        credentials: "include"
                    });

                    if (!nicknameResponse.ok) {
                        const nicknameError = await nicknameResponse.json();
                        errorElement.textContent = nicknameError.message;
                        errorElement.style.visibility = "visible";
                        hasError = true;
                    } else {
                        // 닉네임이 성공적으로 변경되면 세션을 새로 로드해서 반영
                        userInfo = await loadUserInfo(); // 세션에서 최신 정보 반영
                    }
                }
            }

            // 이미지 파일이 선택된 경우 업로드 요청
            const file = fileInput.files[0];
            if (file) {
                const formData = new FormData();
                formData.append("image", file);

                const uploadResponse = await fetch("http://localhost:2000/upLoadProfile", {
                    method: "POST",
                    body: formData,
                    credentials: "include"
                });

                if (!uploadResponse.ok) {
                    const error = await uploadResponse.json();
                    alert("프로필 이미지 업로드 실패: " + error.message);
                    hasError = true;
                } else {
                    const result = await uploadResponse.json();
                    uploadedProfileImageUrl = result.imageUrl;

                    // 프로필 이미지 URL 업데이트 요청
                    const imageResponse = await fetch(`http://localhost:3000/users/profileImg/${userInfo.userId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ newProfileImg: uploadedProfileImageUrl }),
                        credentials: "include"
                    });

                    if (!imageResponse.ok) {
                        const imageError = await imageResponse.json();
                        alert("프로필 이미지 변경 실패: " + imageError.message);
                        hasError = true;
                    } else {
                        profileImage.src = uploadedProfileImageUrl; // 프로필 이미지 업데이트
                        // 프로필 변경 후 세션 업데이트
                        userInfo.profileImage = uploadedProfileImageUrl; // 세션에 반영된 정보 업데이트
                    }
                }
            }

            if (!hasError) {
                // 모든 요청 성공 시
                showToast();
            }
        } catch (error) {
            alert("네트워크 오류 발생: " + error.message);
        }
    });
});