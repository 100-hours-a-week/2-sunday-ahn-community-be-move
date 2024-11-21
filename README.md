## 커뮤니티 만들기 과제<br>

#### 앞으로 예정
- DB연결 후 post가져오는것 userId로 author 프로필 가져오기

### 작업현황<br>


### 1주차와 비교<br>
- date를 DB에 데이터가 도착했을 때 설정
- author의 정보들을 받는것을 작성자의 userId로 조회하여 나머지 nickname, profileImage 조회

#### GET
- [x] /users/logout/{userId} 유저 로그아웃
- [x] /posts/{postId} 게시물 상세조회
- [x] /posts 게시물 리스트 조회

#### POST
- [x] /auth/nickname 닉네임 중복 검사
- [x] /posts 게시물 등록
- [x] /comments 댓글 등록
- [x] /auth/regist 유저 회원가입
- [x] /auth/login 유저 로그인
- [x] /auth/email 이메일 중복 검사

#### PUT
- [x] /comments/{commentId} 댓글 수정
- [x] /posts/{postId} 게시물수정
- [x] /users/profileImg/{userId} 유저 프로필 이미지 변경

#### PATCH
- [x] /users/password/{userId} 비밀번호 수정
- [x] /users/nickname/{userId} 닉네임 수정

#### DELETE
- [x] /users/withdraw/{userId} 유저 회원 탈퇴
- [x] /comments/{commentId} 댓글삭제
- [x] /posts/{postId} 게시물 삭제

# 실행방법<br>
npm start