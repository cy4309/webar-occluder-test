// import { LoadingOutlined } from "@ant-design/icons";

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center font-semibold fixed inset-0">
      {/* <div className="text-6xl">
        <LoadingOutlined />
      </div> */}
      Loading...
    </div>
  );
};

export default LoadingIndicator;
