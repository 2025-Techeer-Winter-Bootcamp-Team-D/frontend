//손익흐름도 비용 랭킹
import React, { useMemo } from "react";
import type { ExpenseItem } from "../../types";

interface ExpenseRankingProps {
  expenses: ExpenseItem[];
  totalRevenue: number;
}

// 비용 항목별 색상
const EXPENSE_COLORS: Record<string, string> = {
  매출원가: "#FF6B6B",
  판매비와관리비: "#4ECDC4",
  인건비: "#45B7D1",
  감가상각비: "#96CEB4",
  연구개발비: "#FFEAA7",
  기타비용: "#DDA0DD",
  이자비용: "#98D8C8",
  법인세비용: "#F7DC6F",
};

const getExpenseColor = (name: string): string => {
  return EXPENSE_COLORS[name] || "#A0A0A0";
};

export const ExpenseRanking: React.FC<ExpenseRankingProps> = ({
  expenses,
  totalRevenue,
}) => {
  // 비용을 금액 기준으로 정렬
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  // 총 비용 계산
  const totalExpense = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses]);

  return (
    <div className="space-y-3">
      {sortedExpenses.map((expense, idx) => {
        const color = getExpenseColor(expense.name);

        return (
          <div
            key={expense.name}
            className="group relative p-3 rounded-lg hover:bg-[#F8F9FB] transition-all duration-200"
          >
            {/* 순위와 이름 */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {idx + 1}
                </span>
                <span className="text-[14px] font-semibold text-[#333]">
                  {expense.name}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[14px] font-bold text-[#1a1a1a]">
                  ₩{(expense.amount / 1000000000000).toFixed(2)}조
                </span>
                <span className="text-[11px] text-[#888]">
                  매출 대비 {expense.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* 총 비용 합계 */}
      <div className="mt-4 p-4 bg-gradient-to-r from-[#F8F9FB] to-[#EEF2F7] rounded-xl border border-[#E5EAEF]">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[13px] text-[#555] font-semibold">
              총 비용 합계
            </span>
            <span className="text-[11px] text-[#888]">
              매출 대비{" "}
              {totalRevenue > 0
                ? ((totalExpense / totalRevenue) * 100).toFixed(1)
                : 0}
              %
            </span>
          </div>
          <span className="text-[18px] font-extrabold text-[#0046FF]">
            ₩{(totalExpense / 1000000000000).toFixed(2)}조
          </span>
        </div>
      </div>
    </div>
  );
};
