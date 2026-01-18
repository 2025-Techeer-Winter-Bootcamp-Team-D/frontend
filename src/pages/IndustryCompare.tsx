import React, { useState, useMemo, useEffect } from "react";
import GlassCard from "../components/Layout/GlassCard";
import ParallelCoordinatesChart from "../components/Charts/ParallelCoordinatesChart";
import {
  ArrowLeft,
  TrendingUp,
  Info,
  ChevronDown,
  X,
  ChevronRight,
  Trophy,
} from "lucide-react";
import { PageView } from "../types";
import type {
  Stock,
  AxisKey,
  BrushRange,
  IndustryNewsItem,
  IndustryData,
  TimeRange,
  IndustryKey,
} from "../types";
import { SAMPLE_STOCKS } from "../constants";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from "recharts";

interface AnalysisProps {
  setPage: (page: PageView) => void;
  initialIndustryId?: string;
  starred: Set<string>;
  onToggleStar: (code: string) => void;
  setCompanyCode?: (code: string) => void;
}

// Generate random sparkline data for the mini chart
const generateSparklineData = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    i,
    value: 50 + Math.random() * 20 - 10,
  }));
};

// Helper to create dummy companies for industries we don't need fully detailed mock data for
const createMockCompanies = (
  sectorName: string,
  basePrice: number,
  count: number,
) => {
  return Array.from({ length: count }, (_, i) => {
    const isUp = Math.random() > 0.4;
    const changeVal = (Math.random() * 3).toFixed(2);
    return {
      name: `${sectorName} 관련주 ${String.fromCharCode(65 + i)}`,
      code: `00${Math.floor(Math.random() * 9000) + 1000}0`,
      price: (
        basePrice + Math.floor(Math.random() * 10000 - 5000)
      ).toLocaleString(),
      change: `${isUp ? "+" : "-"}${changeVal}%`,
      per: parseFloat((Math.random() * 20 + 5).toFixed(2)),
      pbr: parseFloat((Math.random() * 3 + 0.5).toFixed(2)),
      roe: parseFloat((Math.random() * 15 + 5).toFixed(2)),
      aiScore: Math.floor(Math.random() * 30 + 60),
      marketCap: `${Math.floor(Math.random() * 50 + 1)}조 ${Math.floor(Math.random() * 9000)}억`,
    };
  });
};

const industryDB: Record<IndustryKey, IndustryData> = {
  finance: {
    id: "finance",
    name: "금융 (Finance)",
    indexName: "KRX Banks",
    indexValue: 765.42,
    changeValue: 12.5,
    changePercent: 1.66,
    outlook:
      "최근 고금리 기조 유지와 정부의 밸류업 프로그램 시행으로 인해 금융 섹터는 구조적인 재평가 국면에 진입했습니다. 은행주를 중심으로 주주환원율이 30%를 상회하며 배당 매력이 부각되고 있으며, 비이자 이익 부문의 성장도 가시화되고 있습니다. 다만, 하반기 부동산 PF 관련 충당금 이슈가 단기적인 변동성을 확대시킬 수 있으나, 기초 체력(Fundamentals)은 여전히 견고하다는 평가가 지배적입니다.",
    insights: {
      positive:
        "정부의 기업 밸류업 프로그램 지속 추진으로 저PBR 금융주의 주주환원 확대 기대감이 지속되고 있습니다.",
      risk: "부동산 PF 부실 우려에 따른 대손충당금 적립 부담이 하반기 실적의 주요 변수로 작용할 전망입니다.",
    },
    companies: [
      {
        name: "신한지주",
        code: "055550",
        price: "78,200",
        change: "+0.51%",
        per: 4.82,
        pbr: 0.45,
        roe: 10.2,
        aiScore: 85,
        marketCap: "40조 1,230억",
      },
      {
        name: "KB금융",
        code: "105560",
        price: "72,100",
        change: "+1.12%",
        per: 5.1,
        pbr: 0.48,
        roe: 9.8,
        aiScore: 82,
        marketCap: "38조 5,400억",
      },
      {
        name: "하나금융",
        code: "086790",
        price: "58,400",
        change: "-0.32%",
        per: 4.2,
        pbr: 0.38,
        roe: 9.5,
        aiScore: 78,
        marketCap: "28조 2,100억",
      },
      {
        name: "우리금융",
        code: "316140",
        price: "14,800",
        change: "+0.15%",
        per: 3.95,
        pbr: 0.35,
        roe: 9.1,
        aiScore: 75,
        marketCap: "12조 4,500억",
      },
      {
        name: "카카오뱅크",
        code: "323410",
        price: "25,300",
        change: "-1.50%",
        per: 35.2,
        pbr: 2.1,
        roe: 5.4,
        aiScore: 68,
        marketCap: "10조 8,000억",
      },
      {
        name: "기업은행",
        code: "024110",
        price: "13,200",
        change: "+0.40%",
        per: 3.5,
        pbr: 0.31,
        roe: 9.2,
        aiScore: 72,
        marketCap: "9조 5,000억",
      },
      {
        name: "BNK금융",
        code: "138930",
        price: "8,400",
        change: "-0.20%",
        per: 3.2,
        pbr: 0.25,
        roe: 8.5,
        aiScore: 65,
        marketCap: "2조 7,000억",
      },
    ],
    news: [
      {
        id: 1,
        title: "11월 경상수지 122억4000만 달러 흑자...반도체·자동차 수출 호조",
        source: "경제",
        time: "4시간 전",
        content:
          "지난해 11월 한국의 경상수지가 122억4000만 달러 흑자를 기록하며 31개월 연속 흑자 흐름을 이어갔습니다. 이는 반도체와 자동차 수출의 호조 덕분으로, 누적 경상수지는 1018억2000만 달러에 달해 전년도 기록을 초과했습니다. 한국은행의 발표에 따르면, 상품수지 흑자는 133억1000만 달러로 역대 최대치를 기록했으며, 수출은 601억1000만 달러로 전년 동월 대비 5.5% 증가했습니다. 반면, 수입은 468억 달러로 소폭 감소했습니다. 서비스수지는 여행과 기타 서비스에서 27억3000만 달러 적자를 기록했습니다.\n\n이러한 경상수지 흑자 확대는 반도체 수출의 증가와 함께 비IT 품목인 승용차의 선전이 주요 요인으로 작용했습니다. 그러나 반도체를 제외한 무역수지는 감소세를 보였고, 서비스수지의 적자도 여전히 존재했습니다.\n\n이로 인해 다음과 같은 인사이트를 도출할 수 있습니다.\n\n첫째, 반도체 산업의 지속적인 성장세는 한국 경제에 긍정적인 영향을 미치고 있으며, 향후에도 이 같은 추세가 이어질 경우 경상수지 흑자 규모가 더욱 확대될 것으로 기대됩니다.\n둘째, 자동차와 같은 비IT 품목의 수출 증가도 주목할 만한 요소로, 이는 한국의 제조업 경쟁력을 강화하는 데 기여할 수 있습니다.\n셋째, 반도체를 제외한 무역수지의 감소는 미국의 관세 부과와 같은 외부 요인에 영향을 받고 있어, 향후 무역 정책의 변화에 주목할 필요가 있습니다.",
      },
      {
        id: 2,
        title: "은행권 연체율 소폭 상승, 건전성 관리 '비상'",
        source: "매일경제",
        time: "3시간 전",
        content:
          "중소기업과 가계 대출 연체율이 소폭 상승하며 은행권 건전성 관리에 비상등이 켜졌다. 금융당국은 대손충당금 적립을 확대하라고 주문하고 있으며, 각 은행은 리스크 관리 모니터링을 강화하고 있다.",
      },
      {
        id: 3,
        title: "신한금융, AI 기반 자산관리 서비스 고도화",
        source: "전자신문",
        time: "5시간 전",
        content:
          "신한금융그룹이 생성형 AI를 활용한 초개인화 자산관리 서비스를 출시했다. 고객의 투자 성향과 목표를 분석하여 최적의 포트폴리오를 제안하며, 시장 변동성에 실시간으로 대응하는 리밸런싱 알림 기능도 탑재했다.",
      },
    ],
  },
  semicon: {
    id: "semicon",
    name: "반도체 (Semicon)",
    indexName: "KRX Semicon",
    indexValue: 3420.5,
    changeValue: 45.2,
    changePercent: 1.34,
    outlook:
      "AI 반도체 수요의 폭발적인 증가와 메모리 반도체 가격 반등이 맞물려 본격적인 실적 개선 구간에 진입했습니다. HBM(고대역폭메모리) 시장 선점을 위한 경쟁이 치열해지는 가운데, 레거시 공정의 가동률 회복도 긍정적입니다. 다만, 글로벌 경기 둔화에 따른 스마트폰 및 PC 수요 회복 지연은 리스크 요인입니다.",
    insights: {
      positive: "AI 서버 투자 확대로 HBM 등 고부가가치 제품 수요 급증",
      risk: "중국의 레거시 반도체 추격 및 지정학적 리스크",
    },
    companies: [
      {
        name: "삼성전자",
        code: "005930",
        price: "73,400",
        change: "+0.96%",
        per: 15.2,
        pbr: 1.45,
        roe: 8.5,
        aiScore: 92,
        marketCap: "430조 2,100억",
      },
      {
        name: "SK하이닉스",
        code: "000660",
        price: "164,500",
        change: "+2.10%",
        per: -15.4,
        pbr: 2.1,
        roe: -5.2,
        aiScore: 95,
        marketCap: "119조 8,000억",
      },
      {
        name: "한미반도체",
        code: "042700",
        price: "142,000",
        change: "+5.40%",
        per: 65.2,
        pbr: 12.5,
        roe: 35.4,
        aiScore: 88,
        marketCap: "13조 5,000억",
      },
      {
        name: "DB하이텍",
        code: "000990",
        price: "45,200",
        change: "-0.50%",
        per: 8.5,
        pbr: 1.2,
        roe: 12.5,
        aiScore: 70,
        marketCap: "2조 100억",
      },
    ],
    news: [
      {
        id: 101,
        title: "삼성전자, HBM3E 12단 양산 임박... 엔비디아 공급 기대",
        source: "전자신문",
        time: "2시간 전",
        content: "...",
      },
      {
        id: 102,
        title: "반도체 수출 5개월 연속 플러스, 완연한 회복세",
        source: "연합뉴스",
        time: "4시간 전",
        content: "...",
      },
    ],
  },
  auto: {
    id: "auto",
    name: "자동차 (Auto)",
    indexName: "KRX Auto",
    indexValue: 1850.3,
    changeValue: -12.5,
    changePercent: -0.67,
    outlook:
      "피크아웃 우려에도 불구하고 하이브리드 차량(HEV) 판매 호조와 고환율 효과로 양호한 실적이 예상됩니다. 전기차(EV) 수요 둔화(Chasm)를 하이브리드 라인업 강화로 방어하고 있으며, 주주환원 정책 강화도 긍정적입니다. 미국 대선 결과에 따른 IRA 법안 변화 가능성은 중장기적인 불확실성 요인입니다.",
    insights: {
      positive: "하이브리드 판매 비중 확대로 수익성 방어",
      risk: "전기차 시장 성장 둔화 및 경쟁 심화",
    },
    companies: [
      {
        name: "현대차",
        code: "005380",
        price: "245,000",
        change: "-1.20%",
        per: 5.4,
        pbr: 0.75,
        roe: 12.5,
        aiScore: 88,
        marketCap: "51조 5,000억",
      },
      {
        name: "기아",
        code: "000270",
        price: "112,000",
        change: "-0.80%",
        per: 4.8,
        pbr: 0.85,
        roe: 15.2,
        aiScore: 89,
        marketCap: "44조 2,000억",
      },
      {
        name: "현대모비스",
        code: "012330",
        price: "230,500",
        change: "+0.50%",
        per: 6.5,
        pbr: 0.55,
        roe: 7.5,
        aiScore: 75,
        marketCap: "21조 8,000억",
      },
      {
        name: "HL만도",
        code: "204320",
        price: "34,200",
        change: "+1.50%",
        per: 9.2,
        pbr: 0.9,
        roe: 8.5,
        aiScore: 72,
        marketCap: "1조 6,000억",
      },
      ...createMockCompanies("자동차", 15000, 3),
    ],
    news: [],
  },
  bio: {
    id: "bio",
    name: "바이오 (Bio)",
    indexName: "KRX Health",
    indexValue: 2150.1,
    changeValue: 35.4,
    changePercent: 1.67,
    outlook:
      "금리 인하 기대감과 함께 바이오 섹터에 대한 투자 심리가 개선되고 있습니다. 특히 ADC(항체약물접합체), 비만 치료제 등 신규 모달리티에 대한 관심이 뜨거우며, 대형 바이오 시밀러 기업들의 미국 시장 침투율 확대가 실적 성장을 견인할 것으로 보입니다.",
    insights: {
      positive: "금리 인하 시 자금 조달 여건 개선 및 밸류에이션 매력 부각",
      risk: "신약 개발 임상 실패 리스크",
    },
    companies: [
      {
        name: "삼성바이오",
        code: "207940",
        price: "812,000",
        change: "+2.50%",
        per: 65.4,
        pbr: 8.2,
        roe: 12.5,
        aiScore: 90,
        marketCap: "57조 8,000억",
      },
      {
        name: "셀트리온",
        code: "068270",
        price: "185,000",
        change: "+1.80%",
        per: 45.2,
        pbr: 4.5,
        roe: 10.2,
        aiScore: 85,
        marketCap: "40조 5,000억",
      },
      {
        name: "유한양행",
        code: "000100",
        price: "72,500",
        change: "-0.50%",
        per: 35.2,
        pbr: 2.1,
        roe: 8.5,
        aiScore: 80,
        marketCap: "5조 8,000억",
      },
      ...createMockCompanies("바이오", 40000, 4),
    ],
    news: [],
  },
  battery: {
    id: "battery",
    name: "2차전지 (Battery)",
    indexName: "KRX Battery",
    indexValue: 4500.2,
    changeValue: -85.0,
    changePercent: -1.85,
    outlook:
      "전기차 수요 성장 둔화(Chasm)와 메탈 가격 하락으로 인해 단기적인 실적 부진이 지속되고 있습니다. 다만, 북미 시장 중심의 출하량 증가와 ESS(에너지저장장치) 시장 확대가 하반기 반등의 트리거가 될 수 있습니다. 차세대 배터리(전고체 등) 기술 개발 현황에도 주목해야 합니다.",
    insights: {
      positive: "북미 합작 공장 가동 본격화로 AMPC 수혜 확대",
      risk: "전기차 판매 부진 장기화 및 양극재 판가 하락",
    },
    companies: [
      {
        name: "LG에너지",
        code: "373220",
        price: "385,000",
        change: "-1.50%",
        per: 85.2,
        pbr: 4.5,
        roe: 5.5,
        aiScore: 78,
        marketCap: "90조",
      },
      {
        name: "POSCO퓨처",
        code: "003670",
        price: "265,000",
        change: "-2.10%",
        per: 105.2,
        pbr: 8.5,
        roe: 4.2,
        aiScore: 75,
        marketCap: "20조",
      },
      {
        name: "에코프로비엠",
        code: "247540",
        price: "235,000",
        change: "-0.80%",
        per: 95.4,
        pbr: 9.2,
        roe: 6.5,
        aiScore: 72,
        marketCap: "23조",
      },
      ...createMockCompanies("2차전지", 50000, 4),
    ],
    news: [],
  },
  internet: {
    id: "internet",
    name: "인터넷 (Internet)",
    indexName: "KRX Internet",
    indexValue: 1205,
    changeValue: 15,
    changePercent: 1.2,
    outlook:
      "플랫폼 규제 완화 기대감과 함께 광고 시장의 회복세가 감지되고 있습니다. 네이버, 카카오 등 주요 플랫폼 기업들의 AI 서비스 본격화(B2B/B2C)가 새로운 성장 동력으로 작용할 전망입니다.",
    insights: {
      positive: "AI 서비스 수익화 가시화",
      risk: "글로벌 빅테크와의 경쟁 심화",
    },
    companies: createMockCompanies("플랫폼", 60000, 7),
    news: [],
  },
  ent: {
    id: "ent",
    name: "엔터 (Ent)",
    indexName: "KRX Ent",
    indexValue: 850,
    changeValue: -5,
    changePercent: -0.6,
    outlook:
      "주요 아티스트들의 활동 재개와 글로벌 팬덤 확장이 지속되고 있으나, 앨범 판매량 피크아웃 우려가 주가 상단을 제한하고 있습니다.",
    insights: {
      positive: "신인 그룹 데뷔 모멘텀",
      risk: "중국 공구 감소 및 앨범 판매 둔화",
    },
    companies: createMockCompanies("엔터", 30000, 7),
    news: [],
  },
  steel: {
    id: "steel",
    name: "철강 (Steel)",
    indexName: "KRX Steel",
    indexValue: 1450,
    changeValue: 8,
    changePercent: 0.5,
    outlook:
      "중국 경기 부양책에 대한 기대감과 원재료 가격 안정화가 긍정적이나, 전방 산업인 건설 경기 침체가 수요 회복을 제한하고 있습니다.",
    insights: {
      positive: "PBR 0.3배 수준의 저평가 매력",
      risk: "중국 철강 수요 부진 지속",
    },
    companies: createMockCompanies("철강", 50000, 7),
    news: [],
  },
  ship: {
    id: "ship",
    name: "조선 (Ship)",
    indexName: "KRX Heavy",
    indexValue: 980,
    changeValue: 18,
    changePercent: 1.8,
    outlook:
      "신조선가 상승세가 지속되는 가운데, 고부가가치 선박(LNG선 등) 위주의 선별 수주로 수익성 개선이 가속화되고 있습니다.",
    insights: {
      positive: "3년치 이상의 충분한 수주 잔고",
      risk: "인력난 및 후판 가격 협상",
    },
    companies: createMockCompanies("조선", 25000, 7),
    news: [],
  },
  const: {
    id: "const",
    name: "건설 (Const)",
    indexName: "KRX Const",
    indexValue: 520,
    changeValue: -5,
    changePercent: -1.0,
    outlook:
      "국내 주택 시장 침체와 부동산 PF 리스크가 여전히 주가에 부담으로 작용하고 있습니다. 해외 수주 확대와 신사업(SMR 등) 구체화가 반등의 열쇠입니다.",
    insights: {
      positive: "해외 플랜트 수주 회복",
      risk: "미분양 증가 및 PF 우발채무",
    },
    companies: createMockCompanies("건설", 12000, 7),
    news: [],
  },
  retail: {
    id: "retail",
    name: "유통 (Retail)",
    indexName: "KRX Consumer",
    indexValue: 890,
    changeValue: 4,
    changePercent: 0.5,
    outlook:
      "고물가에 따른 소비 심리 위축이 지속되고 있으나, 편의점 및 식자재 유통 등 필수 소비재 중심의 방어적인 매력이 유효합니다.",
    insights: {
      positive: "외국인 관광객 증가 면세점 회복",
      risk: "내수 소비 부진 장기화",
    },
    companies: createMockCompanies("유통", 80000, 7),
    news: [],
  },
  telecom: {
    id: "telecom",
    name: "통신 (Telecom)",
    indexName: "KRX Telecom",
    indexValue: 350,
    changeValue: 1,
    changePercent: 0.3,
    outlook:
      "전통적인 경기 방어주로서 안정적인 배당 매력이 부각됩니다. AI(B2B) 사업 확장을 통해 통신업의 성장 한계를 극복하려는 시도가 이어지고 있습니다.",
    insights: {
      positive: "높은 배당 수익률",
      risk: "정부의 가계 통신비 인하 압박",
    },
    companies: createMockCompanies("통신", 40000, 7),
    news: [],
  },
};

// -- Mini Sparkline Component --
const MiniChart = ({ color }: { color: string }) => {
  const data = generateSparklineData();
  return (
    <div className="h-8 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const IndustryAnalysis: React.FC<AnalysisProps> = ({
  setPage,
  initialIndustryId,
  starred,
  onToggleStar,
  setCompanyCode,
}) => {
  const [selectedIndustry, setSelectedIndustry] =
    useState<IndustryKey>("finance");
  const [timeRange, setTimeRange] = useState<TimeRange>("6M");
  const [selectedNews, setSelectedNews] = useState<IndustryNewsItem | null>(
    null,
  );

  // API 데이터 state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{
    outlook?: string;
    insights?: { positive: string; risk: string };
  } | null>(null);

  // Parallel Coordinates Chart State
  const [filters, setFilters] = useState<Partial<Record<AxisKey, BrushRange>>>(
    {},
  );
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  const filteredIds = useMemo(() => {
    const ids = new Set<string>();
    SAMPLE_STOCKS.forEach((stock) => {
      let pass = true;
      for (const key of Object.keys(filters) as AxisKey[]) {
        const range = filters[key];
        if (range && (stock[key] < range.min || stock[key] > range.max)) {
          pass = false;
          break;
        }
      }
      if (pass) ids.add(stock.id);
    });
    return ids;
  }, [filters]);

  // Handle deep linking from dashboard
  useEffect(() => {
    if (initialIndustryId && industryDB[initialIndustryId as IndustryKey]) {
      setSelectedIndustry(initialIndustryId as IndustryKey);
    }
  }, [initialIndustryId]);

  // Use the selected industry data directly.
  // Since we populated all keys in industryDB, we don't need a fallback.
  const currentData = industryDB[selectedIndustry];

  const handleToggleStar = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    onToggleStar(code);
  };

  const handleCompanyClick = (code: string) => {
    if (setCompanyCode) {
      setCompanyCode(code);
      setPage(PageView.COMPANY_DETAIL);
    }
  };

  const trendData = useMemo(() => {
    let labels: string[] = [];
    switch (timeRange) {
      case "1M":
        labels = ["1주", "2주", "3주", "4주"];
        break;
      case "3M":
        labels = ["D-90", "D-60", "D-30", "Current"];
        break;
      case "6M":
        labels = ["1월", "2월", "3월", "4월", "5월", "6월"];
        break;
      case "1Y":
        labels = ["23.Q3", "23.Q4", "24.Q1", "24.Q2"];
        break;
    }

    const result = [];
    let current = currentData.indexValue;
    const volatility = currentData.indexValue * 0.05;

    for (let i = labels.length - 1; i >= 0; i--) {
      if (i === labels.length - 1) {
        result.unshift({ time: labels[i], value: current });
      } else {
        const change = (Math.random() - 0.45) * volatility;
        current -= change;
        result.unshift({ time: labels[i], value: Math.round(current) });
      }
    }
    return result;
  }, [selectedIndustry, timeRange, currentData.indexValue]);

  return (
    <div className="animate-fade-in pb-12 relative">
      <button
        onClick={() => setPage(PageView.DASHBOARD)}
        className="flex items-center text-slate-500 hover:text-shinhan-blue mb-4 transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" />
        대시보드로 돌아가기
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            산업 분석
            <span className="text-gray-300">|</span>
            <span className="text-shinhan-blue">
              {currentData.name.split(" (")[0]}
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {currentData.indexName} 지수 및 주요 구성 종목 심층 분석
          </p>
        </div>
        <div className="relative">
          {/* Rounded-md */}
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value as IndustryKey)}
            className="appearance-none bg-white border border-gray-200 text-slate-700 text-sm rounded-md focus:ring-shinhan-blue focus:border-shinhan-blue block pl-4 pr-10 py-2.5 outline-none shadow-sm cursor-pointer min-w-[200px]"
          >
            {Object.values(industryDB).map((ind) => (
              <option key={ind.id} value={ind.id}>
                {ind.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Sector Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <GlassCard className="p-6 col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-shinhan-blue" />
                {currentData.indexName} 지수 추이
              </h3>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-slate-900">
                  {currentData.indexValue.toLocaleString()}
                </span>
                <span
                  className={`font-medium px-2 py-0.5 rounded text-sm ${currentData.changeValue > 0 ? "text-red-500 bg-red-50" : "text-blue-500 bg-blue-50"}`}
                >
                  {currentData.changeValue > 0 ? "+" : ""}
                  {currentData.changeValue} (
                  {currentData.changeValue > 0 ? "+" : ""}
                  {currentData.changePercent}%)
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {["1M", "3M", "6M", "1Y"].map((p) => (
                <button
                  key={p}
                  onClick={() => setTimeRange(p as TimeRange)}
                  // Rounded-md
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    timeRange === p
                      ? "bg-shinhan-blue text-white shadow-md shadow-blue-500/30"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={
                        currentData.changeValue > 0 ? "#EF4444" : "#0046FF"
                      }
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={
                        currentData.changeValue > 0 ? "#EF4444" : "#0046FF"
                      }
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: number | undefined) => [
                    value ? value.toLocaleString() : "0",
                    "지수",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={currentData.changeValue > 0 ? "#EF4444" : "#0046FF"}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94A3B8" }}
                />
                <YAxis hide domain={["auto", "auto"]} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6" variant="dark">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Info size={18} className="text-shinhan-gold" />
            산업분야 전망
          </h3>
          {loading ? (
            <p className="text-white/60 text-sm">로딩 중...</p>
          ) : error ? (
            <p className="text-red-300 text-sm">{error}</p>
          ) : (
            <div className="space-y-3">
              {/* 분석 내용 글라스 카드 */}
              <div className="bg-white/25 backdrop-blur-sm rounded-lg border border-white/30 p-4">
                <p className="text-white text-sm leading-relaxed">
                  {analysis?.outlook ??
                    currentData.outlook ??
                    "전망 정보가 없습니다."}
                </p>
              </div>
              {(analysis?.insights || currentData.insights) && (
                <div className="space-y-2">
                  <div className="bg-white/25 backdrop-blur-sm rounded-lg border border-white/30 p-3 flex items-start gap-2">
                    <span className="px-2 py-0.5 bg-green-500/80 text-white text-[10px] font-bold rounded-full shrink-0">
                      긍정
                    </span>
                    <p className="text-xs text-white leading-relaxed">
                      {analysis?.insights?.positive ??
                        currentData.insights?.positive}
                    </p>
                  </div>
                  <div className="bg-white/25 backdrop-blur-sm rounded-lg border border-white/30 p-3 flex items-start gap-2">
                    <span className="px-2 py-0.5 bg-red-500/80 text-white text-[10px] font-bold rounded-full shrink-0">
                      리스크
                    </span>
                    <p className="text-xs text-white leading-relaxed">
                      {analysis?.insights?.risk ?? currentData.insights?.risk}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </GlassCard>
      </div>

      {/* --- Top 3 Companies (Rankings) --- */}
      <h3 className="text-lg font-bold text-slate-700 mb-4 px-2">
        {currentData.name.split(" (")[0]} 산업 기업 순위
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-start">
        {currentData.companies.slice(0, 3).map((company, index) => {
          const isFirst = index === 0;
          const isSecond = index === 1;
          const isThird = index === 2;

          let containerClasses =
            "p-6 relative overflow-hidden group hover:-translate-y-1 transition-all flex flex-col";
          let badgeClasses = "";
          let label = "";

          if (isFirst) {
            containerClasses +=
              " border-yellow-200 bg-white shadow-sm min-h-[260px] mt-2";
            badgeClasses = "bg-yellow-100 text-yellow-600";
            label = "1st Place";
          } else if (isSecond) {
            containerClasses +=
              " border-slate-200 bg-white shadow-sm min-h-[260px] mt-2";
            badgeClasses = "bg-slate-100 text-slate-500";
            label = "2nd Place";
          } else {
            containerClasses +=
              " border-orange-200 bg-white shadow-sm min-h-[260px] mt-2";
            badgeClasses = "bg-orange-100 text-orange-600";
            label = "3rd Place";
          }

          return (
            <GlassCard
              key={company.code}
              className={containerClasses}
              onClick={() => handleCompanyClick(company.code)}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${badgeClasses}`}
                  >
                    <Trophy size={20} />
                  </div>
                  <div>
                    <div
                      className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${isFirst ? "text-yellow-600" : isSecond ? "text-slate-500" : "text-orange-500"}`}
                    >
                      {label}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      {company.code}
                    </div>
                    <button
                      onClick={(e) => handleToggleStar(e, company.code)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <StarIcon isActive={starred.has(company.code)} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={(e) => handleToggleStar(e, company.code)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <StarIcon isActive={starred.has(company.code)} />
                </button>
              </div>

              {/* Center Content */}
              <div className="text-center mb-6">
                <h3
                  className={`font-bold text-slate-800 mb-2 ${isFirst ? "text-2xl" : "text-xl"}`}
                >
                  {company.name}
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={`text-lg font-bold ${isFirst ? "text-slate-900" : "text-slate-700"}`}
                  >
                    {company.price}
                  </span>
                  <span
                    className={`text-sm font-bold px-2 py-0.5 rounded ${company.change.startsWith("+") ? "text-red-500 bg-red-50" : "text-blue-500 bg-blue-50"}`}
                  >
                    {company.change}
                  </span>
                </div>
              </div>

              {/* Footer Metrics */}
              <div
                className={`mt-auto pt-4 border-t ${isFirst ? "border-yellow-100" : "border-gray-50"}`}
              >
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-[10px] text-gray-400 mb-1">
                      시가총액
                    </div>
                    <div className="text-sm font-bold text-slate-600">
                      {company.marketCap}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 mb-1">ROE</div>
                    <div className="text-sm font-bold text-shinhan-blue">
                      {company.roe}%
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* --- All Companies Ranking Table --- */}
      <div className="mb-10">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="pl-6 pr-2 py-3 font-normal w-12"></th>
                  <th className="px-2 py-3 font-normal text-center w-10">
                    순위
                  </th>
                  <th className="px-6 py-3 font-normal w-16"></th>
                  <th className="px-6 py-3 font-normal text-center">기업명</th>
                  <th className="px-6 py-3 font-normal text-center">주가</th>
                  <th className="px-6 py-3 font-normal text-center">변동</th>
                  <th className="px-6 py-3 font-normal text-center">
                    미니차트
                  </th>
                  <th className="px-6 py-3 font-normal text-center">ROE</th>
                  <th className="px-6 py-3 font-normal text-center">
                    시가총액
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentData.companies.map((company, index) => (
                  <tr
                    key={company.code}
                    className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                    onClick={() => handleCompanyClick(company.code)}
                  >
                    <td className="pl-6 pr-2 py-4">
                      <button
                        onClick={(e) => handleToggleStar(e, company.code)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <StarIcon isActive={starred.has(company.code)} />
                      </button>
                    </td>
                    <td className="px-2 py-4 text-center">
                      <span className="font-bold text-slate-600 text-lg">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={`${company.name} logo`}
                          className="inline-block w-8 h-8 rounded-md object-cover"
                        />
                      ) : (
                        <span className="inline-flex w-8 h-8 rounded-md bg-white border border-gray-200 items-center justify-center font-bold text-slate-600 text-xs shadow-sm">
                          {company.name.charAt(0)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-800 text-base">
                      {company.name}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700 text-base">
                      {company.price}
                    </td>
                    <td
                      className={`px-6 py-4 text-center font-medium ${company.change.startsWith("+") ? "text-red-500" : "text-blue-500"}`}
                    >
                      {company.change}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-block">
                        <MiniChart
                          color={
                            company.change.startsWith("+")
                              ? "#EF4444"
                              : "#3B82F6"
                          }
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-800">
                      {company.roe >= 0 ? "+" : ""}
                      {company.roe}%
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600 font-medium">
                      {company.marketCap}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- Parallel Coordinates Chart --- */}
      <div className="mb-10">
        <h3 className="text-lg font-bold text-slate-700 mb-4 px-2">
          나만의 저평가 우량주 발굴 (Parallel Coordinates)
        </h3>
        <p className="text-slate-500 mb-4 px-2">
          각 축을 드래그하여 조건을 설정하고, 조건에 맞는 종목을 찾아보세요
        </p>
        <ParallelCoordinatesChart
          data={SAMPLE_STOCKS}
          onFilterChange={setFilters}
          filters={filters}
          filteredIds={filteredIds}
          onStockSelect={setSelectedStock}
          selectedStockId={selectedStock?.id ?? null}
        />
      </div>

      {/* --- News Section --- */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-700 mb-4 px-2 flex items-center gap-2">
          뉴스 <ChevronRight size={18} />
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentData.news.length > 0 ? (
            currentData.news.slice(0, 6).map((news) => (
              <GlassCard
                key={news.id}
                className="p-5 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group flex items-start gap-4"
                onClick={() => setSelectedNews(news)}
              >
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 mb-2 line-clamp-2 leading-snug group-hover:text-shinhan-blue transition-colors">
                    {news.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{news.source}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{news.time}</span>
                  </div>
                </div>
                {/* Rounded-md */}
                <div className="w-20 h-20 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                  {/* Placeholder for news image */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200"></div>
                </div>
              </GlassCard>
            ))
          ) : (
            // Rounded-md
            <div className="col-span-3 text-center py-10 text-gray-400 bg-white/50 rounded-md border border-gray-100">
              해당 산업의 최신 뉴스가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* --- News Modal (Bottom Sheet Style) --- */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedNews(null)}
          ></div>
          {/* Rounded-lg */}
          <div className="bg-white w-full max-w-2xl sm:rounded-lg rounded-t-lg shadow-2xl z-10 animate-fade-in-up max-h-[85vh] overflow-y-auto flex flex-col relative">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 relative z-10 rounded-t-lg">
              <h3 className="font-bold text-sm text-slate-500 text-center">
                토픽 인사이트
              </h3>
              <button
                onClick={() => setSelectedNews(null)}
                className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 leading-snug mb-4">
                {selectedNews.title}
              </h2>
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-8 border-b border-gray-100 pb-4">
                <span className="font-medium text-slate-700">
                  {selectedNews.source}
                </span>
                <span>{selectedNews.time}</span>
              </div>

              <div className="flex flex-col sm:flex-row-reverse gap-6 mb-6">
                {/* Rounded-md */}
                <div className="w-full sm:w-1/3 h-40 bg-gray-200 rounded-md flex-shrink-0"></div>
                <p className="text-slate-700 leading-loose text-lg flex-1">
                  {selectedNews.content}
                </p>
              </div>

              {/* Rounded-md */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Icon for Star
const StarIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={isActive ? "#FFD700" : "none"}
    stroke={isActive ? "#FFD700" : "#CBD5E1"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="transition-colors duration-200"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default IndustryAnalysis;
