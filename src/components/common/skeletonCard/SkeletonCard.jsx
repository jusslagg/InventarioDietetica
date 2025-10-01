const SkeletonCard = () => {
  return (
    <div className="flex w-52 flex-col gap-4">
      <div className="skeleton h-32 w-full" />
      <div className="skeleton h-4 w-28" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-full" />
    </div>
  );
};

export default SkeletonCard;
