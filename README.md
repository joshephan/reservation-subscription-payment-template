# 예약 플랫폼 보일러 플레이트(야놀자 클론 코딩)

야놀자, 에어비앤비, 호텔림스 등 예약 플랫폼의 보일러플레이트 코드를 저장합니다.

## 백엔드 개발 순서

1. Schema를 짠다 ERD를 짠다.

2. Service

3. Controller

4. Module

### DB Sync가 제공되는지

일반적으로 ORM에서는 제공함, 드리즐 사용 경험이 적으니 확인

### REDIS 캐싱

API 캐싱

### 결제

포트원 대시보드 콘솔 접근 + 개발용 키 발급 + API 연결

### Supabase DB + S3 storage 버캣

정적 자원 CRUD 처리

### Algolia를 사용해서 검색

이 부분은 대시보드 콘솔 접근 후에 해당 function을 업로드

### 사용자들의 로그

NoSQL 독립적으로 저장, RDS와 참조가 필요 없어서
AWS DynamoDB, Firebase firestore

## 구독 서비스

구독 테이블 (Subscription)

취소하는 경우에 대해서 결제 가능한 날짜까지는 사용이 가능할 것

### drizzle-orm의 nullable 처리가 굉장히 이상함

.notNull() 표시가 없는 스키마의 컬럼에 대해서는
insert, update가 불가능
이유는 $inferInsert 타입에 없는 컬럼에 대해서는 처리가 불가능하다.

- 포트원 결제 웹훅 처리
- Algolia 검색 연동(Get)
- 사용자 로그 저장(NoSQL 독립적으로 저장하는 경우가 많다)