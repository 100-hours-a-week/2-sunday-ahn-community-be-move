document.addEventListener("DOMContentLoaded", async () => {
    const submitButton = document.querySelector(".submitButton");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const passwordError = document.getElementById("passwordError");
    const confirmPasswordError = document.getElementById("confirmPasswordError");

    const userInfo = await loadUserInfo();

    // 비밀번호 유효성 검사 함수
    const validatePassword = (password) => 
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/.test(password);

    // 비밀번호 확인 검사
    const validateConfirmPassword = (password, confirmPassword) => 
        password === confirmPassword;

    // 비밀번호 유효성 검사 후 메시지 표시
    const checkPasswordValidity = () => {
        const passwordValue = passwordInput.value.trim();
        const confirmPasswordValue = confirmPasswordInput.value.trim();

        // 에러 초기화
        passwordError.textContent = "";
        confirmPasswordError.textContent = "";

        if (!passwordValue) {
            passwordError.textContent = "*비밀번호를 입력해주세요";
            passwordError.style.visibility = "visible";
            return false;
        }

        if (!validatePassword(passwordValue)) {
            passwordError.textContent = "*비밀번호는 8자 이상 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.";
            passwordError.style.visibility = "visible";
            return false;
        }

        if (!confirmPasswordValue) {
            confirmPasswordError.textContent = "*비밀번호를 한번 더 입력해주세요";
            confirmPasswordError.style.visibility = "visible";
            return false;
        }

        if (!validateConfirmPassword(passwordValue, confirmPasswordValue)) {
            confirmPasswordError.textContent = "*비밀번호와 다릅니다.";
            confirmPasswordError.style.visibility = "visible";
            return false;
        }

        return true;
    };

    // 제출 버튼 클릭 시 처리
    submitButton.addEventListener("click", async (event) => {
        event.preventDefault();

        if (checkPasswordValidity()) {
            const passwordData = { newPassword: passwordInput.value.trim() };
            const { userId } = userInfo;

            try {
                const response = await fetch(`http://3.36.118.177:3000/users/password/${userId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(passwordData),
                    credentials: "include"
                });

                if (response.ok) {
                    showToast(); // 성공 시 토스트 메시지 표시
                } else {
                    const error = await response.json();
                    confirmPasswordError.textContent = error.message;
                    confirmPasswordError.style.visibility = "visible";
                }
            } catch (error) {
                alert('네트워크 오류 발생');
            }
        }
    });
});

// 토스트 메시지 표시 함수
const showToast = () => {
    const toast = document.querySelector(".finish");
    if (toast) {
        toast.style.visibility = "visible";
        toast.style.opacity = 0.9;
        setTimeout(() => {
            toast.style.opacity = 0;
            setTimeout(() => {
                toast.style.visibility = "hidden";
            }, 300);
        }, 1000);
    }
};
