// import { QuestionCircleOutlined } from "@ant-design/icons";

const Error: React.FC = () => {
  return (
    <>
      <div className="w-full h-full flex flex-col justify-center items-center">
        {/* <div className="text-6xl">
          <QuestionCircleOutlined />
        </div> */}
        <p className="text-lg mt-4">Missing page...Please try again later.</p>
      </div>
    </>
  );
};

export default Error;
