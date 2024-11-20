document.addEventListener("DOMContentLoaded", function () {
    const emailInput = document.getElementById("emailInput");
    const passwordInput = document.getElementById("passwordInput");
    const loginButton = document.getElementById("loginButton");

    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");

    // 로그인 버튼을 처음부터 비활성화
    loginButton.disabled = true;
    loginButton.style.backgroundColor = "#ACA0EB";

    // 이메일 유효성 검사
    function validateEmail() {
        const emailValue = emailInput.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        emailError.textContent = ""; // 에러 메시지 초기화

        if (!emailValue) {
            emailError.textContent = "*이메일을 입력해주세요.";
            emailError.style.visibility = "visible";
            return false;
        } else if (!emailPattern.test(emailValue)) {
            emailError.textContent = "*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)";
            emailError.style.visibility = "visible";
            return false;
        } else {
            emailError.style.visibility = "hidden";
            return true;
        }
    }

    // 비밀번호 유효성 검사
    function validatePassword() {
        const passwordValue = passwordInput.value;
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;
        passwordError.textContent = ""; // 에러 메시지 초기화

        if (!passwordValue) {
            passwordError.textContent = "*비밀번호를 입력해주세요.";
            passwordError.style.visibility = "visible";
            return false;
        } else if (!passwordPattern.test(passwordValue)) {
            passwordError.textContent = "*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 포함해야 합니다.";
            passwordError.style.visibility = "visible";
            return false;
        } else {
            passwordError.style.visibility = "hidden";
            return true;
        }
    }

    // 버튼 활성화/비활성화 제어
    function toggleLoginButton() {
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();

        if (isEmailValid && isPasswordValid) {
            loginButton.disabled = false;
            loginButton.style.backgroundColor = "#7F6AEE";
        } else {
            loginButton.disabled = true;
            loginButton.style.backgroundColor = "#ACA0EB";
        }
    }

    // 입력 이벤트 발생 시 유효성 검사 실행
    emailInput.addEventListener("input", toggleLoginButton);
    passwordInput.addEventListener("input", toggleLoginButton);

    // 로그인 버튼 클릭 시 API 호출 및 처리
    loginButton.addEventListener("click", async (e) => {
        e.preventDefault(); // 폼 제출 방지

        // 유효성 검사 통과 여부 확인
        if (validateEmail() && validatePassword()) {
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            try {
                const response = await fetch('http://localhost:3000/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password }),
                    credentials: 'include' // 세션 쿠키 포함
                });

                const result = await response.json();

                // 응답에 따라 처리
                if (response.ok) {
                    // 로그인 성공
                    window.location.href = "./posts"; // 게시물리스트 페이지로 이동
                } else {
                    // 실패 시 메시지 표시
                    passwordError.textContent = result.message;
                    passwordError.style.visibility = "visible";
                }
            } catch (error) {
                console.error('네트워크 오류:', error);
                alert("*서버에 연결할 수 없습니다.");
            }
        }
    });
});


document.getElementById('registButton').addEventListener('click', () => {
    console.log("회원가입 클릭")
    window.location.href = "./regist"
});
