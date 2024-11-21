document.addEventListener("DOMContentLoaded", () => {
    const dropdownMenu = document.getElementById("dropdownMenu");
    const normalProfile = document.querySelector(".normalProfile");
    const goBackButton = document.getElementById('goBack');

    // 초기 상태: 드롭다운 메뉴 숨기기
    dropdownMenu.style.display = "none";

    // 드롭다운 메뉴 토글 함수
    const toggleDropdown = () => {
        dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
    };

    // 드롭다운 외부 클릭 시 닫기
    window.addEventListener("click", (event) => {
        if (!event.target.closest(".normalProfile") && !event.target.closest("#dropdownMenu")) {
            dropdownMenu.style.display = "none";
        }
    });

    // header 클릭
    document.getElementById("headerBox").addEventListener("click", () => {
        window.location.href = "/posts"; // 로그인 된 상태라면 posts 페이지로 이동
    });

    // 드롭다운 메뉴 클릭
    document.getElementById("editUserInfo").addEventListener("click", () => {
        window.location.href = "/editUserInfo";
    });

    document.getElementById("editPassword").addEventListener("click", () => {
        window.location.href = "/editPassword";
    });

    document.getElementById("logout").addEventListener("click", async () => {
        console.log("로그아웃 클릭");
        try {
            const response = await fetch('http://localhost:3000/users/logout', {
                method: 'POST',
                credentials: 'include' // 세션 쿠키 포함
            });
            if (response.ok) {
                sessionStorage.removeItem('user');
                window.location.href = "/login";
            } else {
                const error = await response.json();
                alert(`로그아웃 실패: ${error.message}`);
            }
        } catch (error) {
            alert("네트워크 오류 발생");
        }
        window.location.href = "/login";
    });

    // 드롭다운 메뉴 토글 기능 연결
    normalProfile.addEventListener("click", (event) => {
        event.stopPropagation(); // 클릭 이벤트가 상위로 전파되지 않도록 함
        toggleDropdown();
    });

    // 뒤로가기
    if (goBackButton) {
        goBackButton.addEventListener('click', () => {
            console.log("뒤로가기 클릭");
            window.history.back(); // 이전 페이지로 이동
        });
    }
});

// 로그인되지 않은 경우 로그인 페이지로 리다이렉션
const loadUserInfo = async () => {
    try {
        const userInfoResponse = await fetch('http://localhost:3000/auth/userInfo', {
            method: 'GET',
            credentials: 'include' // 세션 쿠키 포함
        });

        if (userInfoResponse.status === 401) {
            alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
            window.location.href = '/login';
            return null;
        }

        if (!userInfoResponse.ok) {
            console.error("서버 응답 실패: ", userInfoResponse.status);
            throw new Error('Failed to fetch user information.');
        }

        const profileImageSrc = document.getElementById("profileImage");
        const userInfoData = await userInfoResponse.json();

        if (userInfoData.isLogin && userInfoData.data) {
            sessionStorage.setItem('user', JSON.stringify(userInfoData.data)); // 세션에 정보 저장
            profileImageSrc.src = userInfoData.data.profileImage;
            return userInfoData.data;
        } else {
            profileImageSrc.src = './images/sample.jpeg';
            throw new Error('사용자 정보가 없습니다.');
        }
    } catch (error) {
        console.error("loadUserInfo 에러 발생: ", error.message);
        alert(error.message);
        return null;
    }
};

// 날짜 포맷
const formatDateToCustomFormat = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
