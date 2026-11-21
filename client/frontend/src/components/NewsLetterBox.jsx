import React from "react";

const NewsLetterBox = () => {
  const onSubmitHandler = (event) => {
    event.preventDefault();
  };
  return (
    <div className="my-16 rounded-[2rem] bg-gradient-to-r from-[#123d30] via-[#1d4d3e] to-[#d9a74a] p-8 text-center text-[#f8eed8] shadow-xl sm:p-12">
      <p className="text-2xl font-semibold">
        Get 25% off your first order
      </p>
      <p className="mt-3 text-sm text-[#f5e7c8] sm:text-base">
        Join our newsletter for offers, new dishes, and exclusive deals.
      </p>
      <form
        onSubmit={onSubmitHandler}
        className="mx-auto my-6 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-center sm:rounded-full sm:bg-white sm:p-2"
      >
        <input
          className="min-w-0 w-full rounded-xl bg-white px-4 py-3 text-gray-700 outline-none sm:flex-1 sm:rounded-full sm:bg-transparent"
          type="email"
          placeholder="Enter your email"
          required
        />
        <button
          type="submit"
          className="home-primary-button w-full whitespace-nowrap rounded-xl px-6 py-3 text-sm font-semibold transition sm:w-auto sm:rounded-full"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
};

export default NewsLetterBox;
