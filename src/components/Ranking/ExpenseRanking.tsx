//손익흐름도 매출 원천천
import React from "react";
import type { ExpenseItem } from "../../types";

interface ExpenseRankingProps {
  expenses: ExpenseItem[];
  totalRevenue: number;
}

export const ExpenseRanking: React.FC<ExpenseRankingProps> = ({ expenses }) => {
  return (
    <div className="space-y-4">
      {expenses.map((expense, idx) => (
        <div
          key={expense.name}
          className="flex items-center justify-between pb-3 border-b border-[#F0F3F5] last:border-0"
        >
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-[#0046FF] w-4">
              {idx + 1}
            </span>
            <span className="text-[14px] font-medium text-[#333]">
              {expense.name}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[14px] font-bold text-[#1a1a1a]">
              ₩{(expense.amount / 100000000000).toFixed(1)}천억원
            </span>
            <span className="text-[11px] text-[#888]">
              {expense.percentage}% 비중
            </span>
          </div>
        </div>
      ))}

      <div className="mt-6 p-4 bg-[#F8F9FB] rounded-[8px]">
        <div className="flex justify-between items-center">
          <span className="text-[13px] text-[#555] font-semibold">
            총 비용 합계
          </span>
          <span className="text-[16px] font-extrabold text-[#1a1a1a]">
            ₩
            {(
              expenses.reduce((acc, curr) => acc + curr.amount, 0) /
              1000000000000
            ).toFixed(1)}
            조원
          </span>
        </div>
      </div>
    </div>
  );
};
