import Image from "next/image";
import Link from "next/link";

const Guest = () => {
  return (
    <div className="font-sans bg-gray-100 text-gray-800">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-between p-3 md:p-16 bg-gray-100 pt-20">
        <div className="flex-1 mb-8 xl:pl-10">
          <h1 className="text-2xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Welcome to goeyDev Ecommerce
          </h1>
          <p className="md:text-xl mb-6">
            goeyDev Ecommerce is an initial release created for hobby and
            learning purposes. All items listed are virtual and do not involve
            any real transactions or financial exchanges. This platform is not
            intended for commercial use at this stage.
          </p>

          <button className="w-full md:w-auto bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white px-4 py-2 rounded-md font-medium cursor-pointer">
            <Link href="/sign-in">Get Started</Link>
          </button>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <Image
            src="/mew.png"
            alt="Pokemon Mew"
            className="w-full md:max-w-md rounded-tl-3xl rounded-br-3xl shadow-lg"
            width={200}
            height={50}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="h-1 bg-gray-300"></div>

      {/* Frequently Asked Questions Section */}
      <div className="py-16 px-8 bg-white">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h3 className="text-xl font-bold">goeyDev Ecommerce?</h3>
            <p className="text-gray-600">
              goeyDev Ecommerce is an initial release created for hobby and
              learning purposes.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold">How does it work?</h3>
            <p className="text-gray-600">
              goeyDev Ecommerce is a demo website designed to let you experience
              online shopping with virtual products and simulated Stripe payment
              processing. No real transactions or physical items are involved.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold">
              Is registration on goeyDev Ecommerce free ?
            </h3>
            <p className="text-gray-600">
              It’s only for experience and learning purposes — no real payments
              or products involved.
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-1 bg-gray-300"></div>

      {/* Testimonials Section */}
      <div className="py-16 px-8 bg-gray-100">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          What Our Users Say
        </h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-md shadow">
            <p className="text-gray-700 mb-4">&quot;App Descriptions.!&quot;</p>
            <p className="text-purple-500 font-bold">- Name</p>
          </div>
          <div className="bg-white p-6 rounded-md shadow">
            <p className="text-gray-700 mb-4">&quot;App Descriptions.&quot;</p>
            <p className="text-purple-500 font-bold">- Name</p>
          </div>
          <div className="bg-white p-6 rounded-md shadow">
            <p className="text-gray-700 mb-4">
              &quot;&#39; App Descriptions.&quot;
            </p>
            App Descript
            <p className="text-purple-500 font-bold">- Name</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guest;
