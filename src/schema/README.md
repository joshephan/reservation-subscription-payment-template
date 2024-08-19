# 스키마 구조

해당 서비슨는 예약 가능한 상품을 파는 서비스의 백엔드 소스코드입니다.
상품에 대한 내용은 예시로 작성되었습니다.

## User 스키마

모든 구매 Customer 회원 정보

## Hotel Manager 스키마

호텔을 등록할 수 있는 프로바이더 고객

## Hotel 스키마

각각의 호텔 정보, Hotel Manager가 등록

## HotelRoom 스키마

각각의 호텔의 방

## Reservation 스키마

각각의 예약

## Payment History 스키마

각각의 결제 내역

- 예약과 동시에 결제하는 경우
- 예치금을 넣어두는 형태의 결제
- 예약 취소 또는 결제 취소시 환불 기록

## Hotel Review 스키마

각각의 호텔의 리뷰, User가 작성하는 리뷰

## Hotel Review Reply 스키마

Hotel Manager가 Hotel Review에 대해서 응답을 작성

## 하드 딜리트 vs 소프트 딜리트

하드 딜리트 방식을 토이 프로젝트에서 사용해도 큰 상관이 없음
소프트 딜리트를 어디에 넣어야 할지를 정해야함
