const SkeletonTableRow = () => {
  return (
    <tr className="animate-pulse">
      <td className="p-4">
        <div className="bg-gray-300 rounded-lg h-12 w-12"></div>
      </td>
      <td className="p-4">
        <div className="bg-gray-300 rounded h-6 w-3/5"></div>
      </td>
      <td className="p-4">
        <div className="bg-gray-300 rounded h-6 w-4/5"></div>
      </td>
      <td className="p-4">
        <div className="bg-gray-300 rounded h-6 w-2/5"></div>
      </td>
      <td className="p-4">
        <div className="bg-gray-300 rounded h-6 w-1/3"></div>
      </td>
      <td className="p-4">
        <div className="bg-gray-300 rounded h-6 w-2/5"></div>
      </td>
      <td className="p-4">
        <div className="bg-gray-300 rounded h-6 w-3/4"></div>
      </td>
      <td className="p-4">
        <div className="bg-gray-300 rounded h-6 w-2/4"></div>
      </td>
      <td className="p-4">
        <div className="bg-gray-300 rounded h-6 w-1/3"></div>
      </td>
      <td className="p-4">
        <div className="bg-gray-300 rounded h-6 w-1/3"></div>
      </td>
    </tr>
  );
};

export default SkeletonTableRow;
