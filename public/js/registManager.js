// 뒤로가기 및 로그인 이동 버튼 설정
document.getElementById('goBack').addEventListener('click', () => {
    console.log("뒤로가기 클릭");
    window.history.back();
});

document.getElementById('loginButton').addEventListener('click', () => {
    console.log("로그인하러가기 클릭");
    window.location.href = "/login";
});

document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("fileInput");
    const profileImage = document.getElementById("profileImage");
    const profileBox = document.getElementById("profileBox");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const nicknameInput = document.getElementById("nickname");
    const registButton = document.getElementById("registButton");
    const profileError = document.getElementById("profileError");
    let profileImageFile = null; 

    async function checkDuplicate(apiUrl, value, errorElement) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(value)
            });
            const result = await response.json();
            if (response.ok) {
                errorElement.textContent = "";
                return true;
            } else if (response.status === 401) {
                errorElement.textContent = result.message;
                return false;
            } else {
                errorElement.textContent = "서버 오류가 발생했습니다.";
                return false;
            }
        } catch (error) {
            console.error("중복 검사 요청 실패:", error);
            errorElement.textContent = "네트워크 오류가 발생했습니다.";
            return false;
        }
    }

    async function checkEmailDuplicate() {
        const email = emailInput.value.trim();
        const emailError = document.getElementById("emailError");
        if (!email) {
            emailError.textContent = "*이메일을 입력해주세요.";
            return false;
        }
        return await checkDuplicate("http://localhost:3000/auth/email", { email }, emailError);
    }

    async function checkNicknameDuplicate() {
        const nickname = nicknameInput.value.trim();
        const nicknameError = document.getElementById("nicknameError");
        if (!nickname) {
            nicknameError.textContent = "*닉네임을 입력해주세요.";
            return false;
        }
        return await checkDuplicate("http://localhost:3000/auth/nickname", { nickname }, nicknameError);
    }

    function resetProfileImage() {
        profileImage.src = "";
        profileImage.style.display = "none";
        profileBox.style.background = "#BDBDBD";
        profileImageFile = null;
    }

    function validateEmailFormat() {
        const email = emailInput.value.trim();
        const emailError = document.getElementById("emailError");
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        emailError.textContent = "";
        if (!emailPattern.test(email)) {
            emailError.textContent = "*올바른 이메일 주소 형식을 입력해주세요.";
            return false;
        }
        return true;
    }

    function validatePassword() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const passwordError = document.getElementById("passwordError");
        const confirmPasswordError = document.getElementById("confirmPasswordError");
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;
        passwordError.textContent = "";
        confirmPasswordError.textContent = "";

        if (!passwordPattern.test(password)) {
            passwordError.textContent = "*비밀번호는 8자 이상, 대문자, 소문자, 숫자, 특수문자를 각각 포함해야 합니다.";
            return false;
        } else if (password !== confirmPassword) {
            confirmPasswordError.textContent = "*비밀번호가 일치하지 않습니다.";
            return false;
        }
        return true;
    }

    function validateNicknameFormat() {
        const nickname = nicknameInput.value.trim();
        const nicknameError = document.getElementById("nicknameError");
        nicknameError.textContent = "";
        if (nickname.length > 10 || /\s/.test(nickname)) {
            nicknameError.textContent = "*닉네임은 10자 이하, 띄어쓰기 없음이어야 합니다.";
            return false;
        }
        return true;
    }

    function validateProfileImage() {
        if (!profileImageFile) {
            profileError.textContent = "*프로필 사진을 추가해주세요.";
            return false;
        }
        profileError.textContent = "";
        return true;
    }

    async function toggleSubmitButton() {
        const isEmailFormatValid = validateEmailFormat();
        const isPasswordValid = validatePassword();
        const isNicknameFormatValid = validateNicknameFormat();
        const isProfileImageValid = validateProfileImage();

        const isEmailUnique = await checkEmailDuplicate();
        const isNicknameUnique = await checkNicknameDuplicate();

        if (isEmailFormatValid && isPasswordValid && isNicknameFormatValid && isProfileImageValid && isEmailUnique && isNicknameUnique) {
            registButton.disabled = false;
            registButton.style.backgroundColor = "#7F6AEE";
        } else {
            registButton.disabled = true;
            registButton.style.backgroundColor = "#ACA0EB";
        }
    }

    emailInput.addEventListener("focusout", async () => {
        await checkEmailDuplicate();
        toggleSubmitButton();
    });
    nicknameInput.addEventListener("focusout", async () => {
        await checkNicknameDuplicate();
        toggleSubmitButton();
    });
    passwordInput.addEventListener("focusout", toggleSubmitButton);
    confirmPasswordInput.addEventListener("focusout", toggleSubmitButton);

    profileBox.addEventListener("click", function () {
        fileInput.click();
    });

    fileInput.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            profileImageFile = file;
            const reader = new FileReader();
            reader.onload = function (e) {
                profileImage.src = e.target.result;
                profileImage.style.display = "block";
                profileBox.style.background = "none";
                profileError.textContent = "";
            };
            reader.readAsDataURL(file);
        } else {
            resetProfileImage();
        }
        toggleSubmitButton();
    });

    registButton.addEventListener("click", async function (event) {
        event.preventDefault();

        if (!validateEmailFormat() || !validatePassword() || !validateNicknameFormat() || !validateProfileImage()) {
            return;
        }

        const formData = new FormData();
        formData.append("image", profileImageFile);
        try {
            const uploadResponse = await fetch('http://localhost:2000/upLoadProfile', {
                method: 'POST',
                body: formData
            });

            if (!uploadResponse.ok) {
                const error = await uploadResponse.json();
                console.error('프로필 이미지 업로드 실패:', error);
                alert('프로필 이미지 업로드에 실패했습니다.');
                return;
            }

            const result = await uploadResponse.json();
            const profileImageUrl = result.imageUrl;

            const userData = {
                email: emailInput.value,
                password: passwordInput.value,
                nickname: nicknameInput.value,
                profileImage: profileImageUrl
            };

            const response = await fetch('http://localhost:3000/auth/regist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                alert('회원가입이 완료되었습니다.');
                window.location.href = "/login";
            } else {
                const error = await response.json();
                alert('회원가입 저장에 실패했습니다: ' + error.message);
            }
        } catch (error) {
            alert('서버에 연결할 수 없습니다.');
        }
    });
});
