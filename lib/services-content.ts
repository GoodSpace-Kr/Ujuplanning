// Service scope follows the supplied planning document and the four services
// retained on the homepage. Related work only references confirmed project roles.
export const serviceOfferings = [
  {
    id: 'strategy', number: '01', label: '전략기획', word: 'STRATEGY',
    short: '브랜드가 나아갈 방향을 정합니다.',
    headline: '브랜드의 다음 방향,\n함께 선명하게.',
    introduction: '무엇을 말할지, 누구에게 전할지부터 생각합니다. 브랜드와 시장을 살펴보고, 고객에게 선택받을 이유를 전략과 메시지로 정리합니다.',
    scopes: [
      { title: '브랜드·시장 분석', description: '브랜드의 강점과 과제, 시장과 경쟁사, 고객의 행동을 함께 살펴봅니다.' },
      { title: '마케팅 전략·캠페인 기획', description: '목표에 맞는 방향을 세우고, 어떤 접점에서 어떻게 실행할지 계획합니다.' },
      { title: '브랜드 메시지·커뮤니케이션', description: '브랜드가 전할 핵심 메시지와 일관된 커뮤니케이션 방향을 설계합니다.' },
    ],
    link: { href: '/work#chungho', label: '청호나이스 브랜딩 프로젝트' },
  },
  {
    id: 'creative', number: '02', label: '영상·사진·콘텐츠', word: 'CREATIVE',
    short: '브랜드의 메시지를 장면으로 만듭니다.',
    headline: '좋은 기획이,\n좋은 장면이 되도록.',
    introduction: '영상 한 편, 사진 한 장, 짧은 문장에도 브랜드의 방향이 담겨야 합니다. 매체와 목적에 맞는 형식으로 기획하고, 촬영과 편집, 디자인까지 연결합니다.',
    scopes: [
      { title: '영상 기획·촬영·편집', description: '브랜드·광고 영상, 숏폼, 인터뷰와 행사 스케치 등 목적에 맞는 영상을 제작합니다.' },
      { title: '사진 촬영', description: '제품의 특징과 공간의 분위기, 현장의 순간을 브랜드의 시선으로 담습니다.' },
      { title: '디자인·카피·광고 소재', description: '카드뉴스와 채널 콘텐츠, 광고 소재를 일관된 디자인과 문장으로 완성합니다.' },
    ],
    link: { href: '/work#ohrun', label: '오륜스포츠 캠페인 프로젝트' },
  },
  {
    id: 'performance', number: '03', label: '디지털 퍼포먼스', word: 'PERFORMANCE',
    short: '콘텐츠를 고객의 행동으로 연결합니다.',
    headline: '보이는 광고에서,\n행동을 만드는 광고로.',
    introduction: '브랜드의 목표와 고객을 기준으로 매체와 소재를 설계합니다. 광고 운영에서 얻은 데이터를 살피고, 다음 실행을 개선하는 데 활용합니다.',
    scopes: [
      { title: '네이버·구글·메타 광고 운영', description: '캠페인 목적과 고객의 이용 맥락에 맞춰 매체 전략을 세우고 광고를 운영합니다.' },
      { title: '광고 소재 기획', description: '브랜드의 메시지와 고객의 관심이 만나는 이미지, 영상과 카피를 기획합니다.' },
      { title: '성과 분석·캠페인 최적화', description: '유입과 행동, 전환 데이터를 살펴보고 소재와 운영 방향을 조정합니다.' },
    ],
    link: { href: '/#contact', label: '우리 브랜드의 광고 방향 상담하기' },
  },
  {
    id: 'social', number: '04', label: 'SNS·바이럴', word: 'SOCIAL',
    short: '하나의 브랜드를 꾸준히 전합니다.',
    headline: '하나의 게시물 너머,\n꾸준히 쌓이는 브랜드.',
    introduction: '흩어진 온라인 채널을 하나의 브랜드 흐름으로 연결합니다. 채널별 특성과 고객의 관심에 맞는 콘텐츠를 만들고, 지속적인 운영과 확산을 함께 고민합니다.',
    scopes: [
      { title: 'SNS 채널 기획·운영', description: '채널의 방향과 콘텐츠 주제를 정하고, 일관된 발행 계획으로 운영합니다.' },
      { title: '블로그·숏폼 콘텐츠', description: '검색으로 만나는 정보부터 피드에서 발견하는 이야기까지, 채널에 맞게 제작합니다.' },
      { title: '인플루언서·체험단·바이럴', description: '브랜드와 어울리는 협업을 기획하고, 경험과 이야기가 확산되도록 연결합니다.' },
    ],
    link: { href: '/work#bavarian', label: 'BMW · MINI 채널 콘텐츠 프로젝트' },
  },
] as const;

export type OfferingId = (typeof serviceOfferings)[number]['id'];
