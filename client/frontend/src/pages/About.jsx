import React from "react";
import NewsLetterBox from "../components/NewsLetterBox";
import Title from "../components/Title";

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* Page Title */}
      <div className="text-2xl text-center pb-4">
        <Title text1={"ABOUT"} text2={"US"} />
        <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto">
          Passionate about serving fresh, authentic, and unforgettable Indian meals directly to your doorstep.
        </p>
      </div>

      {/* Main Story Section */}
      <div className="flex flex-col md:flex-row gap-12 my-12 items-center">
        <div className="w-full md:w-1/2 overflow-hidden rounded-2xl shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&auto=format&fit=crop&q=85"
            alt="Our team preparing fresh meals in the kitchen"
            className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="flex flex-col justify-center gap-6 md:w-1/2 text-gray-600 text-sm sm:text-base leading-relaxed">
          <p>
            Born out of a deep passion for authentic Indian flavors and culinary innovation, our journey began with a clear vision: to make restaurant-quality meals accessible from the comfort of home.
          </p>
          <p>
            We carefully handpick fresh, locally sourced ingredients and combine traditional cooking styles with modern quality standards. From rich biryanis and authentic curries to refreshing drinks and handcrafted desserts, every dish is prepared with hygiene and care.
          </p>
          <div className="border-l-4 border-orange-500 pl-4 py-1 bg-orange-50/50 rounded-r-lg">
            <h3 className="font-bold text-gray-800 text-lg">Our Mission</h3>
            <p className="text-gray-600 text-sm mt-1">
              To provide choice, convenience, and absolute confidence in quality—delivering happiness in every meal.
            </p>
          </div>
        </div>
      </div>

      {/* Founders & Chefs Section */}
      {/* <div className="my-16">
        <div className="mb-10 text-center">
          <Title text1={"MEET OUR"} text2={"FOUNDERS & CHEFS"} />
          <p className="mt-2 text-sm text-[#52665d]">
            The dedicated team behind your favorite dining experience
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="group flex flex-col items-center rounded-2xl border border-[#d9c9ab]/70 bg-[#fffaf2] p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#d9a74a]/70 hover:shadow-lg"
            >
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#d9a74a]/50 bg-[#e8f0e9] font-serif text-3xl font-bold text-[#123d30] transition-colors group-hover:border-[#d9a74a]">
                {member.name.charAt(0)}
              </div>

              <h3 className="text-lg font-bold text-[#123d30] transition-colors group-hover:text-[#2d6756]">
                {member.name}
              </h3>
              <p className="mb-3 mt-1 text-xs font-semibold uppercase tracking-wider text-[#9a702d]">
                {member.role}
              </p>
              <p className="text-sm leading-relaxed text-[#52665d]">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div> */}

      {/* Why Choose Us Section */}
      <div className="my-16">
        <div className="text-2xl text-center mb-8">
          <Title text1={"WHY"} text2={"CHOOSE US"} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-2xl p-8 flex flex-col items-center text-center gap-3 bg-white hover:border-orange-400 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-2xl mb-2">
              🥗
            </div>
            <h4 className="font-bold text-gray-800">Fresh Ingredients</h4>
            <p className="text-gray-600 text-sm">
              Prepared daily with premium, locally sourced ingredients and packed with authentic flavors.
            </p>
          </div>

          <div className="border border-gray-200 rounded-2xl p-8 flex flex-col items-center text-center gap-3 bg-white hover:border-orange-400 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-2xl mb-2">
              ⚡
            </div>
            <h4 className="font-bold text-gray-800">Fast & Convenient</h4>
            <p className="text-gray-600 text-sm">
              Easy online ordering allows you to browse the menu and get fresh meals delivered fast.
            </p>
          </div>

          <div className="border border-gray-200 rounded-2xl p-8 flex flex-col items-center text-center gap-3 bg-white hover:border-orange-400 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-2xl mb-2">
              🤝
            </div>
            <h4 className="font-bold text-gray-800">Reliable Support</h4>
            <p className="text-gray-600 text-sm">
              Our support team is ready to assist with your orders, requests, and delivery updates.
            </p>
          </div>
        </div>
      </div>

      <NewsLetterBox />
    </div>
  );
};

export default About;
