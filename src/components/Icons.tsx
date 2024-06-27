import { LucideProps } from "lucide-react";

export const Icons = {
  Logo: (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="200"
      height="50"
    >
      <path
        d="M10 10 Q 20 0, 30 10 T 50 10 Q 60 20, 50 30 T 30 50 Q 20 60, 10 50 T 10 30 Q 0 20, 10 10"
        fill="#007bff"
      />
      <text
        x="65"
        y="35"
        font-family="Arial, Helvetica, sans-serif"
        font-size="30"
        fill="#333"
      >
        Digi
        <tspan fill="#007bff">Lab</tspan>
      </text>
    </svg>
  ),
};
