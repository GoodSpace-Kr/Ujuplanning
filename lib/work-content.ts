import { projects } from './site-content';

// Descriptions expand the existing portfolio's scope, without unverified results.
const stories = [
  {
    id: 'chungho', shortName: '청호나이스', english: 'CHUNGHO NICE',
    introduction: '좋은 제품의 가치는 고객의 언어로 전해질 때 더 가까워집니다. 제품의 기능을 나열하기보다 일상에서 느낄 수 있는 가치에 초점을 맞춥니다.',
    focus: '제품의 강점이 하나의 메시지로 읽히도록.',
    approach: '브랜드 메시지를 중심으로 콘텐츠의 주제와 표현을 정리합니다. 제품을 처음 만나는 순간부터 브랜드를 기억하는 순간까지, 일관된 인상을 만드는 것이 이 작업의 방향입니다.',
    scope: ['브랜드의 강점을 전달하는 메시지 정리', '제품과 일상을 연결하는 콘텐츠 기획', '마케팅 커뮤니케이션의 방향 설정'],
    alt: '청호나이스 정수기와 PURE WATER SOLUTION 메시지가 담긴 브랜드 이미지',
  },
  {
    id: 'bavarian', shortName: 'BMW · MINI', english: 'BAVARIAN MOTORS',
    introduction: '한 장의 콘텐츠에도 브랜드의 성격이 드러나야 합니다. BMW와 MINI의 서로 다른 매력을 살리면서, 채널 안에서 꾸준히 이어지는 이야기를 만듭니다.',
    focus: '하나의 게시물을 넘어, 일관된 채널 경험으로.',
    approach: '차량의 개성, 브랜드의 소식, 프로모션을 콘텐츠로 연결합니다. 각각의 게시물이 독립적으로 읽히면서도 채널 전체에서는 같은 브랜드의 목소리로 느껴지도록 구성합니다.',
    scope: ['브랜드 특성에 맞춘 채널 콘텐츠 기획', '차량·프로모션 이미지와 카드뉴스 제작', '온라인 및 SNS 콘텐츠 운영'],
    alt: '해 질 무렵의 바바리안모터스 전시장과 BMW · MINI 브랜드 공간',
  },
  {
    id: 'ocean', shortName: '오션더힐', english: 'OCEAN THE HILL',
    introduction: '공간의 분위기는 설명보다 장면으로 전해집니다. 머무르고 싶은 풍경과 공간의 특징을 짧은 영상 안에서 선명하게 보여주는 데 집중합니다.',
    focus: '짧게 보아도, 오래 기억되는 공간.',
    approach: '공간을 소개할 포인트를 정하고 촬영과 편집의 흐름을 연결합니다. 숏폼의 짧은 호흡 안에서도 장소의 분위기와 경험이 자연스럽게 전달되도록 기획합니다.',
    scope: ['공간의 특징을 담는 숏폼 콘텐츠 기획', '분위기와 경험을 전하는 영상 촬영', '모바일 시청 흐름에 맞춘 숏폼 편집'],
    alt: '오션더힐의 아치형 건축과 공간을 소개하는 브랜드 이미지',
  },
  {
    id: 'ohrun', shortName: '오륜스포츠', english: 'OHRUN SPORTS',
    introduction: '좋은 장면은 명확한 기획에서 시작됩니다. 전하고 싶은 메시지가 촬영과 편집을 거쳐 실제 광고 화면에 도달할 때까지, 하나의 흐름으로 연결합니다.',
    focus: '기획의 의도가 마지막 화면까지 이어지도록.',
    approach: '캠페인 기획부터 제작, 촬영, 편집과 옥외광고 송출까지 연결하는 통합 광고 작업입니다. 매체에서 보이는 최종 장면을 생각하며 콘텐츠의 방향을 잡습니다.',
    scope: ['캠페인 기획 및 영상 제작 방향 설정', '광고 영상 촬영과 편집', '옥외광고 송출까지 이어지는 실행'],
    alt: '운동장에서 달리는 어린이를 담은 오륜스포츠 광고 영상',
  },
  {
    id: 'byd', shortName: 'BYD', english: 'BYD',
    introduction: '브랜드를 만나는 순간은 화면 밖에서도 이어집니다. 브랜드의 메시지를 실제로 보고 경험할 수 있는 공간의 언어로 풀어냅니다.',
    focus: '브랜드의 인상을, 직접 만나는 경험으로.',
    approach: '브랜드의 메시지와 공간의 목적을 함께 살펴 디자인과 제작으로 연결합니다. 시각 요소들이 하나의 장면으로 읽히고, 현장에서도 일관된 브랜드 경험을 전하는 방향을 지향합니다.',
    scope: ['브랜드 메시지를 담은 공간 기획', '공간의 시각 요소와 디자인 구성', '현장 경험으로 연결하는 제작'],
    alt: 'BYD 차량과 브랜드 디스플레이가 배치된 전시 공간',
  },
] as const;

export const workProjects = stories.map(story => ({
  ...projects.find(project => project.id === story.id)!,
  ...story,
}));
