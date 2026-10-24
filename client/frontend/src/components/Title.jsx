import React from "react";

const Title = ({ text1, text2 }) => {
  return (
    <div className="inline-flex flex-col gap-2 text-center sm:text-left mb-6">
      <div className="text-sm uppercase tracking-[0.35em] text-[#2d6756] font-semibold">
        {text1}
      </div>
      <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#123d30]">
        {text2}
      </h2>
    </div>
  );
};

export default Title;
