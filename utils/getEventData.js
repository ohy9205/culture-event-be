const { Event } = require("../models");
const axios = require("axios");
const { Op } = require("sequelize");

const currentDate = () => {
  return new Date().toISOString().slice(0, 10);
};

// NOTE DB 초기화, 서버 초기화 후 한 번만 실행하는 함수
// 여러 번 실행하면, 같은 이벤트가 중복되어 저장됨.

exports.getInitialData = async () => {
  Event.count()
    .then((count) => {
      if (count === 0) {
        console.log("테이블에 데이터가 없습니다. 초기화를 실행합니다");
        this.getEventData();
      } else {
        console.log(`테이블에 ${count}개의 데이터가 있습니다.`);
      }
    })
    .catch((err) => {
      console.error("데이터 수 조회중 오류 발생", err);
    });
};

exports.getEventData = async () => {
  const response = await axios.get(
    `http://openapi.seoul.go.kr:8088/${process.env.API_KEY}/json/culturalEventInfo/1/1000`
  );
  const eventData = response.data.culturalEventInfo.row;

  const activeEvent = eventData.filter(
    (data) => data.END_DATE.split(" ")[0] >= currentDate()
  );

  activeEvent.map(async (event) => {
    Event.create({
      category: event.CODENAME,
      location: event.GUNAME,
      title: event.TITLE,
      eventPeriod: event.DATE,
      place: event.PLACE,
      hostOrganization: event.ORG_NAME,
      targetAudience: event.USE_TRGT,
      fee: event.USE_FEE,
      performerInfo: event.PLAYER,
      programInfo: event.PROGRAM,
      otherInfo: event.ETC_DESC,
      homePage: event.ORG_LINK,
      latitude: event.LAT,
      longitude: event.LOT,
      isFree: event.IS_FREE === "무료" ? true : false,
      thumbnail: event.MAIN_IMG,
      startDate: event.STRTDATE.split(" ")[0],
      endDate: event.END_DATE.split(" ")[0],
    });
  });
};

const destroyData = async () => {
  await Event.findAll({
    where: {
      endDate: {
        [Op.lt]: currentDate(),
      },
    },
  }).then((expiredEvent) => {
    if (expiredEvent.length > 0) {
      expiredEvent.forEach((event) => {
        event.destroy();
      });
      console.log(`${expiredEvent.length}개의 이벤트가 삭제되었습니다.`);
    } else {
      console.log("기간이 지난 이벤트가 없습니다.");
    }
  });
};

exports.getNewEventData = async () => {
  console.log("new data");
  await destroyData();
  console.log("destroy data finished");

  const response = await axios.get(
    `http://openapi.seoul.go.kr:8088/${process.env.API_KEY}/json/culturalEventInfo/1/1000`
  );
  const eventData = response.data.culturalEventInfo.row;

  const newEvent = eventData.filter(
    (data) => data.RGSTDATE.split(" ")[0] === currentDate()
  );
  newEvent.map(async (event) => {
    Event.create({
      category: event.CODENAME,
      location: event.GUNAME,
      title: event.TITLE,
      eventPeriod: event.DATE,
      place: event.PLACE,
      hostOrganization: event.ORG_NAME,
      targetAudience: event.USE_TRGT,
      fee: event.USE_FEE,
      performerInfo: event.PLAYER,
      programInfo: event.PROGRAM,
      otherInfo: event.ETC_DESC,
      homePage: event.ORG_LINK,
      latitude: event.LAT,
      longitude: event.LOT,
      isFree: event.IS_FREE === "무료" ? true : false,
      thumbnail: event.MAIN_IMG,
      startDate: event.STRTDATE.split(" ")[0],
      endDate: event.END_DATE.split(" ")[0],
    });
  });
};

/**!SECTION
 *   
 {
    CODENAME: '클래식',
    GUNAME: '종로구',
    TITLE: '서울시여성콘서트합창단 제6회 정기연주회',
    DATE: '2023-11-07~2023-11-07',
    PLACE: 'M시어터',
    ORG_NAME: '세종문화회관',
    USE_TRGT: '누구나',
    USE_FEE: 'R석 5만원, S석 3만원',
    PLAYER: '지휘 임진순 피아노 양찬영 배우 김지현, 문민경, 송기호, 김태성  Soprano 염혜원？정은주 정미화 이음정 홍석인  김주형 김미겸 김용희 김미연 ？ Mezzo Soprano？？？？ 이경혜？조인순 곽영순 서명신 김영숙 황은하 박혜성 조영숙？박귀정 김미경？김옥련？강남숙 이은영  Alto 최영숙？박신영？온옥 계경희？이행숙 강명옥？황광희 하경혜？차영실 김순임 장영옥 김연희',
    PROGRAM: '서울특별시 성평등기금 후원으로 초연되었던 합창드라마 ‘그들의 노래’를 정식공연으로 무대에 올린다.',
    ETC_DESC: '회장 서명신 고문 계경희 부회장 온 옥  총무 강명옥 회계 황은하 감사 이음정 파트장 홍석인 박귀정 하경혜',
    ORG_LINK: 'http://pf.kakao.com/_uximUxj/102195073',
    MAIN_IMG: 'https://culture.seoul.go.kr/cmmn/file/getImage.do?atchFileId=abf43c2b5f174f9a9ec27304a16dfb64&thumb=Y',
    RGSTDATE: '2023-09-28',
    TICKET: '시민',
    STRTDATE: '2023-11-07 00:00:00.0',
    END_DATE: '2023-11-07 00:00:00.0',
    THEMECODE: '가족 문화행사',
    LOT: '37.5726241',
    LAT: '126.9760053',
    IS_FREE: '유료',
    HMPG_ADDR: 'https://culture.seoul.go.kr/culture/culture/cultureEvent/view.do?cultcode=143533&menuNo=200008'
  },
 */
