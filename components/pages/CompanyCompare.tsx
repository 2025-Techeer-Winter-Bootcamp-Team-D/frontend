import React, { useState, useMemo, useEffect } from 'react';
import GlassCard from '../components/Layout/GlassCard';
import { ArrowLeft, Plus, X, Search, Info, TrendingUp, BarChart3, HelpCircle, ChevronDown, Check, Edit2, CheckCircle2 } from 'lucide-react';
import { PageView } from '../types';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

interface CompareProps {
    setPage: (page: PageView) => void;
}

type MetricType = 'revenue' | 'operating' | 'net' | 'marketCap';
type TimeRange = '1M' | '3M' | '6M' | '1Y';
type DetailMetricKey = 'eps' | 'operatingMargin' | 'roe' | 'yoy' | 'qoq' | 'pbr' | 'per';

interface MetricOption {
    id: MetricType;
    label: string;
    unit: string;
}

const metricOptions: MetricOption[] = [
    { id: 'revenue', label: '매출액', unit: '십억원' },
    { id: 'operating', label: '영업이익', unit: '십억원' },
    { id: 'net', label: '순이익', unit: '십억원' },
    { id: 'marketCap', label: '시가총액', unit: '조원' },
];

const CHART_COLORS = ['#0046FF', '#DDBB66', '#94A3B8', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B', '#6366F1'];

// -- Dynamic Mock Data Database --
// Expanded to include diverse industries
const allCompanies = ['신한지주', 'KB금융', '하나금융', '우리금융', '카카오뱅크', '삼성생명', '현대해상', '메리츠금융', '삼성전자', '현대차'];

interface CompanyData {
    financials: Record<MetricType, number[]>; // [2023, 2024(E)]
    trends: Record<TimeRange, number[]>; // Array of prices corresponding to time points
    ratios: Record<DetailMetricKey, number>;
}

const mockCompanyDB: Record<string, CompanyData> = {
    '신한지주': {
        financials: { revenue: [310, 350], operating: [85, 92], net: [45, 48], marketCap: [38, 42] },
        trends: {
            '1M': [76000, 77500, 75800, 78200],
            '3M': [72000, 75000, 78200],
            '6M': [42000, 44000, 48000, 52000, 65000, 78200],
            '1Y': [38000, 41000, 48000, 78200]
        },
        ratios: { eps: 8500, operatingMargin: 24.5, roe: 10.2, yoy: 12.5, qoq: 2.1, pbr: 0.45, per: 4.82 }
    },
    'KB금융': {
        financials: { revenue: [305, 340], operating: [82, 90], net: [46, 49], marketCap: [36, 40] },
        trends: {
            '1M': [70000, 71200, 69800, 72100],
            '3M': [68000, 71000, 72100],
            '6M': [58000, 62000, 65000, 68000, 72000, 72100],
            '1Y': [52000, 55000, 65000, 72100]
        },
        ratios: { eps: 8200, operatingMargin: 23.8, roe: 9.8, yoy: 8.4, qoq: -1.5, pbr: 0.48, per: 5.10 }
    },
    '하나금융': {
        financials: { revenue: [280, 310], operating: [75, 82], net: [38, 41], marketCap: [28, 32] },
        trends: {
            '1M': [56000, 57000, 55500, 58400],
            '3M': [54000, 56000, 58400],
            '6M': [45000, 48000, 52000, 51000, 55000, 58400],
            '1Y': [41000, 43000, 52000, 58400]
        },
        ratios: { eps: 7800, operatingMargin: 22.1, roe: 9.5, yoy: 15.2, qoq: 3.8, pbr: 0.38, per: 4.20 }
    },
    '우리금융': {
        financials: { revenue: [230, 260], operating: [60, 68], net: [28, 32], marketCap: [18, 22] },
        trends: {
            '1M': [14000, 14200, 14500, 14800],
            '3M': [13500, 14000, 14800],
            '6M': [12000, 12500, 13000, 13500, 14200, 14800],
            '1Y': [11000, 11500, 13000, 14800]
        },
        ratios: { eps: 3200, operatingMargin: 20.5, roe: 9.1, yoy: 5.5, qoq: 1.2, pbr: 0.35, per: 3.95 }
    },
    '카카오뱅크': {
        financials: { revenue: [150, 180], operating: [40, 55], net: [20, 30], marketCap: [12, 15] },
        trends: {
            '1M': [24000, 24500, 25000, 25300],
            '3M': [23000, 24000, 25300],
            '6M': [20000, 21000, 22000, 23000, 24500, 25300],
            '1Y': [18000, 19000, 22000, 25300]
        },
        ratios: { eps: 950, operatingMargin: 15.2, roe: 5.4, yoy: 25.0, qoq: 10.5, pbr: 2.10, per: 35.2 }
    },
    '삼성생명': {
        financials: { revenue: [200, 220], operating: [50, 55], net: [25, 28], marketCap: [15, 16] },
        trends: {
            '1M': [70000, 71000, 70500, 71500],
            '3M': [68000, 69000, 71500],
            '6M': [65000, 66000, 68000, 69000, 70000, 71500],
            '1Y': [60000, 62000, 68000, 71500]
        },
        ratios: { eps: 4500, operatingMargin: 8.5, roe: 7.2, yoy: 3.5, qoq: 0.5, pbr: 0.65, per: 8.5 }
    },
    '현대해상': {
        financials: { revenue: [180, 190], operating: [45, 48], net: [22, 24], marketCap: [10, 11] },
        trends: {
            '1M': [32000, 32500, 32200, 33000],
            '3M': [31000, 31500, 33000],
            '6M': [30000, 30500, 31000, 31500, 32000, 33000],
            '1Y': [28000, 29000, 31000, 33000]
        },
        ratios: { eps: 3800, operatingMargin: 7.8, roe: 8.5, yoy: 4.2, qoq: 1.1, pbr: 0.55, per: 6.2 }
    },
    '메리츠금융': {
        financials: { revenue: [160, 210], operating: [65, 85], net: [35, 45], marketCap: [25, 30] },
        trends: {
            '1M': [55000, 58000, 62000, 65000],
            '3M': [48000, 55000, 65000],
            '6M': [40000, 45000, 50000, 55000, 60000, 65000],
            '1Y': [35000, 40000, 50000, 65000]
        },
        ratios: { eps: 6500, operatingMargin: 28.5, roe: 15.2, yoy: 30.5, qoq: 8.2, pbr: 1.2, per: 7.5 }
    },
    '삼성전자': {
        financials: { revenue: [258, 302], operating: [6, 35], net: [15, 28], marketCap: [400, 480] },
        trends: {
            '1M': [72000, 73500, 71000, 74000],
            '3M': [69000, 72000, 74000],
            '6M': [68000, 70000, 72000, 71000, 73000, 74000],
            '1Y': [65000, 68000, 72000, 74000]
        },
        ratios: { eps: 4200, operatingMargin: 11.5, roe: 8.2, yoy: 18.5, qoq: 12.2, pbr: 1.4, per: 15.5 }
    },
    '현대차': {
        financials: { revenue: [162, 175], operating: [15, 18], net: [12, 14], marketCap: [50, 60] },
        trends: {
            '1M': [230000, 235000, 240000, 245000],
            '3M': [220000, 230000, 245000],
            '6M': [190000, 200000, 210000, 220000, 230000, 245000],
            '1Y': [180000, 190000, 210000, 245000]
        },
        ratios: { eps: 25000, operatingMargin: 9.8, roe: 12.5, yoy: 8.5, qoq: 3.2, pbr: 0.7, per: 5.5 }
    }
};

const detailedMetricsInfo: Record<DetailMetricKey, { title: string; desc: string; formula: string }> = {
    eps: {
        title: "EPS",
        desc: "주당 순이익(Earning Per Share)으로, 주식 1주가 1년 동안 벌어들인 실제 돈이 얼마인지를 나타내는 지표입니다.",
        formula: "순이익 / 발행주식 수",
    },
    operatingMargin: {
        title: "영업이익률",
        desc: "기업이 본업인 장사를 통해 순수하게 얼마나 효율적으로 이익을 남기고 있는지를 보여주는 지표입니다.",
        formula: "영업이익 / 매출액 × 100 (%)",
    },
    roe: {
        title: "ROE",
        desc: "자기자본이익률로, 기업이 자기자본을 통해 1년간 얼마를 벌었는지를 보여주는 지표입니다. 높을수록 투자 가치가 높습니다.",
        formula: "순이익 / 자기자본 × 100 (%)",
    },
    yoy: {
        title: "YoY",
        desc: "전년 대비 성장률(Year on Year)로, 계절적 요인을 배제하고 작년 같은 기간과 비교했을 때 기업이 얼마나 성장했는지 보여줍니다.",
        formula: "(당분기 매출 / 전년 동기 매출 - 1) × 100 (%)",
    },
    qoq: {
        title: "QoQ",
        desc: "전분기 대비 증감률(Quarter on Quarter)로, 직전 분기와 비교하여 기업의 실적이 최근에 개선되고 있는지 보여줍니다.",
        formula: "(당분기 매출 / 전 분기 매출 - 1) × 100 (%)",
    },
    pbr: {
        title: "PBR",
        desc: "주가 순자산 비율(Price Book-value Ratio)로, 기업이 보유한 전체 재산(청산 가치)에 비해 주가가 어떤 수준인지 보여줍니다.",
        formula: "시가총액 / 순자산",
    },
    per: {
        title: "PER",
        desc: "주가 수익 비율(Price Earning Ratio)로, 기업이 버는 돈에 비해 주가가 얼마나 높게 형성되어 있는지 보여주는 지표입니다.",
        formula: "시가총액 / 순이익",
    }
};


// -- Main Page Component --

const CompanyCompare: React.FC<CompareProps> = ({ setPage }) => {
  // State for Sets
  const [sets, setSets] = useState([
    { id: 1, name: '비교 세트 1', companies: ['신한지주', '삼성전자'] },
    { id: 2, name: '인터넷 뱅크', companies: ['카카오뱅크', '토스뱅크'] },
  ]);
  const [activeSetId, setActiveSetId] = useState(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for Metrics (Top Charts)
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('revenue');
  const [isMetricDropdownOpen, setIsMetricDropdownOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('6M');

  // State for Detailed Metrics (Bottom Section)
  const [activeMetrics, setActiveMetrics] = useState<DetailMetricKey[]>(['eps']);
  const [openInfoKey, setOpenInfoKey] = useState<string | null>(null);

  // State for Renaming
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempSetName, setTempSetName] = useState('');

  const activeSet = sets.find(s => s.id === activeSetId) || sets[0];
  const currentMetricOption = metricOptions.find(o => o.id === selectedMetric) || metricOptions[0];

  // Initialize temp name when active set changes
  useEffect(() => {
      setTempSetName(activeSet.name);
      setIsEditingName(false);
  }, [activeSetId, activeSet.name]);

  // Helper to ensure we have data for the company (fallback for unknown companies)
  const getCompanyData = (name: string) => mockCompanyDB[name] || mockCompanyDB['신한지주'];

  // -- Dynamic Data Generation based on activeSet --

  // 1. Top Bar Chart Data (Revenue, etc.)
  const financialChartData = useMemo(() => {
    const years = ['2023', '2024(E)'];
    return years.map((year, yearIndex) => {
        const dataPoint: any = { year };
        activeSet.companies.forEach(company => {
            const data = getCompanyData(company);
            dataPoint[company] = data.financials[selectedMetric][yearIndex];
        });
        return dataPoint;
    });
  }, [activeSet.companies, selectedMetric]);

  // 2. Trend Line Chart Data
  const trendChartData = useMemo(() => {
      const labelsMap: Record<TimeRange, string[]> = {
          '1M': ['1주', '2주', '3주', '4주'],
          '3M': ['M-2', 'M-1', 'Current'],
          '6M': ['1월', '2월', '3월', '4월', '5월', '6월'],
          '1Y': ['23.Q3', '23.Q4', '24.Q1', '24.Q2']
      };
      const labels = labelsMap[timeRange];
      
      return labels.map((label, index) => {
          const dataPoint: any = { date: label };
          activeSet.companies.forEach(company => {
              const data = getCompanyData(company);
              // Safety check for index
              const val = data.trends[timeRange][index] !== undefined 
                          ? data.trends[timeRange][index] 
                          : data.trends[timeRange][data.trends[timeRange].length - 1];
              dataPoint[company] = val;
          });
          return dataPoint;
      });
  }, [activeSet.companies, timeRange]);

  // 3. Detailed Metrics Data Generation
  // This constructs the `detailedMetricsConfig` dynamically
  const dynamicDetails = useMemo(() => {
      const result: Record<string, any> = {};
      activeMetrics.forEach(key => {
          const info = detailedMetricsInfo[key];
          const chartData = activeSet.companies.map(company => ({
              name: company,
              value: getCompanyData(company).ratios[key]
          }));
          result[key] = { ...info, data: chartData };
      });
      return result;
  }, [activeSet.companies, activeMetrics]);


  const handleAddSet = () => {
    const newId = sets.length + 1;
    const newSet = { id: newId, name: `비교 세트 ${newId}`, companies: [] };
    setSets([...sets, newSet]);
    setActiveSetId(newId);
  };

  const handleRemoveCompany = (companyName: string) => {
    setSets(sets.map(s => {
        if (s.id === activeSetId) {
            return { ...s, companies: s.companies.filter(c => c !== companyName) };
        }
        return s;
    }));
  };

  const handleAddCompany = (companyName: string) => {
    setSets(sets.map(s => {
        if (s.id === activeSetId && !s.companies.includes(companyName)) {
            return { ...s, companies: [...s.companies, companyName] };
        }
        return s;
    }));
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleSaveName = () => {
      if (!tempSetName.trim()) {
          setTempSetName(activeSet.name);
          setIsEditingName(false);
          return;
      }
      setSets(sets.map(s => s.id === activeSetId ? { ...s, name: tempSetName } : s));
      setIsEditingName(false);
  };

  const toggleMetric = (key: DetailMetricKey) => {
      if (activeMetrics.includes(key)) {
          setActiveMetrics(activeMetrics.filter(k => k !== key));
      } else {
          setActiveMetrics([...activeMetrics, key]);
      }
  };

  const filteredCompanies = allCompanies.filter(c => c.includes(searchQuery) && !activeSet.companies.includes(c));


  return (
    <div className="animate-fade-in pb-12 relative">
       {/* Top Navigation */}
       <div className="flex items-center justify-between mb-6">
            <button 
                onClick={() => setPage(PageView.DASHBOARD)}
                className="flex items-center text-slate-500 hover:text-shinhan-blue transition-colors"
            >
                <ArrowLeft size={16} className="mr-1" />
                대시보드
            </button>
            <h1 className="text-xl font-bold text-slate-800 hidden md:block">기업 비교 분석</h1>
            <div className="w-20"></div> {/* Spacer */}
       </div>

       <div className="flex flex-col lg:flex-row gap-8">
            {/* -- Left Sidebar for Sets -- */}
            <div className="lg:w-64 flex-shrink-0 space-y-4">
                <GlassCard className="p-4 bg-white/60">
                    <h2 className="text-sm font-bold text-slate-500 mb-4 px-2 uppercase tracking-wider">나의 비교 세트</h2>
                    <div className="space-y-2">
                        {sets.map((set) => (
                            <button
                                key={set.id}
                                onClick={() => setActiveSetId(set.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                                    activeSetId === set.id 
                                    ? 'bg-shinhan-blue text-white shadow-lg shadow-blue-500/30' 
                                    : 'hover:bg-white text-slate-600'
                                }`}
                            >
                                <span className="font-medium text-sm truncate max-w-[150px]">{set.name}</span>
                                {activeSetId === set.id && <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={handleAddSet}
                        className="w-full mt-4 flex items-center justify-center gap-2 py-3 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-shinhan-blue hover:text-shinhan-blue hover:bg-blue-50 transition-all"
                    >
                        <Plus size={16} />
                        세트 추가하기
                    </button>
                </GlassCard>
            </div>

            {/* -- Main Content Area -- */}
            <div className="flex-1 space-y-8">
                {/* 1. Header & Company Chips */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        {isEditingName ? (
                            <div className="flex items-center gap-2 flex-1 max-w-md">
                                <input 
                                    type="text" 
                                    value={tempSetName}
                                    onChange={(e) => setTempSetName(e.target.value)}
                                    onBlur={handleSaveName}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                    autoFocus
                                    className="text-2xl font-bold text-slate-800 bg-transparent border-b-2 border-shinhan-blue focus:outline-none w-full px-1"
                                />
                                <button onClick={handleSaveName} className="p-2 text-shinhan-blue hover:bg-blue-50 rounded-full">
                                    <CheckCircle2 size={24} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 group">
                                <h2 className="text-2xl font-bold text-slate-800">{activeSet.name}</h2>
                                <button 
                                    onClick={() => setIsEditingName(true)}
                                    className="p-1.5 text-gray-400 hover:text-shinhan-blue hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    title="이름 변경"
                                >
                                    <Edit2 size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        {activeSet.companies.map((company) => (
                             <div key={company} className="flex items-center gap-2 pl-4 pr-2 py-2 bg-white rounded-full border border-gray-200 shadow-sm text-slate-700">
                                <span className="font-bold text-sm">{company}</span>
                                <button 
                                    onClick={() => handleRemoveCompany(company)}
                                    className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        <button 
                            onClick={() => setIsSearchOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-shinhan-light/50 text-shinhan-blue rounded-full border border-blue-100 hover:bg-shinhan-light hover:border-blue-200 transition-all group"
                        >
                            <Plus size={16} className="group-hover:scale-110 transition-transform"/>
                            <span className="text-sm font-bold">기업 추가</span>
                        </button>
                    </div>
                </div>

                {/* 2. Charts Section - Separated Rows */}
                <div className="space-y-6">
                    {/* Row 1: Financial Metrics Comparison (Bar Chart) */}
                    <GlassCard className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <BarChart3 size={20} className="text-shinhan-blue"/>
                                {currentMetricOption.label} 비교 (단위: {currentMetricOption.unit})
                            </h3>
                            
                            <div className="relative">
                                <button 
                                    onClick={() => setIsMetricDropdownOpen(!isMetricDropdownOpen)}
                                    className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 transition-colors shadow-sm"
                                >
                                    {currentMetricOption.label} <ChevronDown size={14} className={`transition-transform ${isMetricDropdownOpen ? 'rotate-180' : ''}`}/>
                                </button>

                                {isMetricDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsMetricDropdownOpen(false)}></div>
                                        <div className="absolute right-0 top-full mt-2 w-40 bg-white/90 backdrop-blur-md border border-white/50 rounded-xl shadow-xl z-20 py-1 animate-fade-in-up">
                                            {metricOptions.map((option) => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => {
                                                        setSelectedMetric(option.id);
                                                        setIsMetricDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                                        selectedMetric === option.id 
                                                        ? 'bg-blue-50 text-shinhan-blue font-bold' 
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={financialChartData} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
                                    <XAxis dataKey="year" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false}/>
                                    <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false}/>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}/>
                                    <Legend wrapperStyle={{paddingTop: '20px'}}/>
                                    {/* Dynamically render bars for each company in the set */}
                                    {activeSet.companies.map((company, index) => (
                                        <Bar 
                                            key={company} 
                                            dataKey={company} 
                                            name={company} 
                                            fill={CHART_COLORS[index % CHART_COLORS.length]} 
                                            radius={[4, 4, 0, 0]} 
                                            barSize={40} 
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    {/* Row 2: Stock Price Trend (Line Chart) */}
                    <GlassCard className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <TrendingUp size={20} className="text-shinhan-blue"/>
                                주가 추이 (최근 {timeRange})
                            </h3>
                            <div className="flex gap-2">
                                {(['1M', '3M', '6M', '1Y'] as TimeRange[]).map((p) => (
                                    <button 
                                        key={p} 
                                        onClick={() => setTimeRange(p)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            timeRange === p 
                                            ? 'bg-shinhan-blue text-white shadow-md shadow-blue-300' 
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendChartData} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
                                    <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false}/>
                                    <YAxis domain={['auto', 'auto']} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false}/>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}/>
                                    <Legend wrapperStyle={{paddingTop: '20px'}}/>
                                    {/* Dynamically render lines for each company */}
                                    {activeSet.companies.map((company, index) => (
                                        <Line 
                                            key={company}
                                            type="monotone" 
                                            dataKey={company} 
                                            name={company} 
                                            stroke={CHART_COLORS[index % CHART_COLORS.length]} 
                                            strokeWidth={3} 
                                            dot={{r: 4}} 
                                            activeDot={{r: 6}} 
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>
                </div>

                {/* 3. Detailed Financial Ratios (Redesigned Grid + Toggle Layout) */}
                <div className="mt-8">
                     <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-lg font-bold text-slate-700">투자 지표 비교</h2>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                        {/* Left: Dynamic Grid Area */}
                        <div className={`flex-1 w-full grid gap-6 auto-rows-min ${activeMetrics.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                            {activeMetrics.map((key) => {
                                const info = dynamicDetails[key];
                                const isInfoOpen = openInfoKey === key;
                                return (
                                    <GlassCard key={key} className="p-6 relative flex flex-col animate-fade-in-up">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-bold text-slate-800">{info.title}</h3>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenInfoKey(isInfoOpen ? null : key);
                                                }}
                                                className={`transition-colors ${isInfoOpen ? 'text-shinhan-blue' : 'text-gray-400 hover:text-shinhan-blue'}`}
                                            >
                                                <HelpCircle size={20} />
                                            </button>
                                            
                                            {/* Info Popup (Tooltip style) inside the card */}
                                            {isInfoOpen && (
                                                <div className="absolute top-12 left-0 right-0 z-20 mx-4 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl p-5 animate-fade-in">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-slate-800 text-lg">{info.title}란?</h4>
                                                        <button onClick={() => setOpenInfoKey(null)} className="text-gray-400 hover:text-gray-600">
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                                        {info.desc}
                                                    </p>
                                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                        <p className="text-xs text-slate-500 font-bold mb-1">계산식</p>
                                                        <p className="text-sm font-mono text-shinhan-blue">{info.formula}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 min-h-[250px] flex items-center justify-center bg-slate-50/50 rounded-xl border border-slate-100 p-4">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={info.data} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
                                                    <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false}/>
                                                    <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false}/>
                                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}/>
                                                    <Bar dataKey="value" name={info.title} radius={[6, 6, 0, 0]} barSize={40}>
                                                        {info.data.map((entry: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </GlassCard>
                                );
                            })}
                        </div>

                        {/* Right: Menu Selection (Tab Style preserved as requested) */}
                        <div className="w-full lg:w-64 flex-shrink-0 sticky top-24">
                            <GlassCard className="p-2 space-y-1">
                                {(Object.keys(detailedMetricsInfo) as DetailMetricKey[]).map((key) => {
                                    const info = detailedMetricsInfo[key];
                                    const isActive = activeMetrics.includes(key);
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => toggleMetric(key)}
                                            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between group ${
                                                isActive 
                                                ? 'bg-gradient-to-r from-blue-50 to-white border border-blue-100 shadow-sm' 
                                                : 'hover:bg-gray-50 border border-transparent text-gray-500'
                                            }`}
                                        >
                                            <span className={`font-bold text-sm ${isActive ? 'text-shinhan-blue' : 'group-hover:text-slate-700'}`}>
                                                {info.title}
                                            </span>
                                            {isActive && (
                                                <div className="bg-shinhan-blue text-white rounded-full p-0.5">
                                                    <Check size={12} strokeWidth={3} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </GlassCard>
                            <p className="text-xs text-gray-400 text-center mt-3 px-2">
                                지표를 클릭하여 차트를 추가/제거할 수 있습니다.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
       </div>

       {/* -- Search Modal Overlay -- */}
       {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)}></div>
            <GlassCard className="w-full max-w-lg relative z-10 p-6 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800">기업 추가</h3>
                    <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                
                <div className="relative mb-6">
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="기업명 또는 종목코드를 입력하세요" 
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-shinhan-blue focus:ring-4 focus:ring-blue-100/50 outline-none transition-all"
                        autoFocus
                    />
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {searchQuery === '' ? (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            <Search size={32} className="mx-auto mb-2 opacity-50" />
                            검색어를 입력하여 기업을 찾아보세요
                        </div>
                    ) : filteredCompanies.length > 0 ? (
                        filteredCompanies.map(company => (
                            <button 
                                key={company}
                                onClick={() => handleAddCompany(company)}
                                className="w-full flex items-center justify-between p-3 hover:bg-blue-50 rounded-xl transition-colors group text-left"
                            >
                                <span className="font-bold text-slate-700 group-hover:text-shinhan-blue">{company}</span>
                                <Plus size={18} className="text-gray-400 group-hover:text-shinhan-blue" />
                            </button>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            검색 결과가 없습니다.
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
       )}

    </div>
  );
};

export default CompanyCompare;