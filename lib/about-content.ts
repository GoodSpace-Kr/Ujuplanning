// Company philosophy and process: supplied homepage planning document, pp. 1–2.
// Featured film: the video featured on the official channel home page.
export const companyFilm = {
  id: 'yLMXVki-XSU',
  title: '우주기획 CEO가 공개하는 브랜드 성장 여정',
  channelUrl: 'https://www.youtube.com/@WOOJUWORLDWIDE',
  watchUrl: 'https://www.youtube.com/watch?v=yLMXVki-XSU',
  thumbnail: 'https://i.ytimg.com/vi/yLMXVki-XSU/hq720.jpg?sqp=-oaymwFBCNAFEJQDSFryq4qpAzMIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB8AEB-AH-CYAC0AWKAgwIABABGGUgZShlMA8=&rs=AOn4CLA5AmHtfHmI5LrSCBszTJ8pkn5OUA',
} as const;

export const aboutStrengths = [
  { title: '브랜드에서 출발하는 전략', description: '브랜드와 시장, 경쟁사와 고객을 살펴봅니다. 무엇을 만들어야 할지에 앞서, 누구에게 어떤 가치를 전할지 방향을 정합니다.', label: 'BRAND & STRATEGY' },
  { title: '기획부터 실행까지', description: '마케팅 전략을 영상과 사진, 디자인과 카피, 디지털 광고와 SNS 운영으로 이어갑니다. 필요한 고객 경험까지 함께 기획하고 실행합니다.', label: 'CREATIVE & EXECUTION' },
  { title: '하나의 방향으로 연결', description: '콘텐츠, 광고, 온라인 채널과 실제 공간. 서로 다른 접점에서도 브랜드의 메시지가 일관되게 전달되도록 연결합니다.', label: 'CONNECTED EXPERIENCE' },
] as const;

export const aboutSteps = [
  { word: 'OBSERVE', title: '관찰하다', description: '브랜드, 시장, 경쟁사와 고객의 행동을 깊이 관찰합니다.', image: '/assets/brand-process/observe.webp', alt: '쌍안경으로 창밖의 사람들을 관찰하는 모습', width: 1600, height: 905 },
  { word: 'DISCOVER', title: '발견하다', description: '브랜드가 놓치고 있던 문제와 새로운 가능성을 발견합니다.', image: '/assets/brand-process/discover.webp', alt: '지도 위를 돋보기로 자세히 살펴보는 모습', width: 948, height: 1600 },
  { word: 'CONNECT', title: '연결하다', description: '발견한 가능성을 전략, 콘텐츠, 광고와 고객 경험으로 연결합니다.', image: '/assets/brand-process/connect.webp', alt: '창에 붙인 메모를 통해 생각을 연결하는 모습', width: 948, height: 1600 },
  { word: 'EXPAND', title: '확장하다', description: '실행과 성과를 통해 브랜드가 더 넓은 시장으로 나아가도록 돕습니다.', image: '/assets/telescope-sequence/mobile/0000.webp', alt: '망원경으로 더 넓은 하늘을 바라보는 모습', width: 960, height: 540 },
] as const;
