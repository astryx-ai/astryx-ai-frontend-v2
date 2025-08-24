const UserMsg = ({ message }: { message: string }) => {
  return (
    <p className="rounded-[20px] p-2 px-4 text-black-60 dark:text-white-90 bg-gray-50 dark:bg-black-80 w-fit max-w-[80%] ml-auto">
      {message}
    </p>
  );
};

export default UserMsg;
