const SkeletonTableRow = () => {
  return (
    <tr className="animate-pulse">
      <td className="p-4">
        <div className="bg-gray-300 rounded-lg h-12 w-12" />
      </td>
      <td className="p-4">
        <div className="bg-gray-300 rounded h-6 w-3/5" />
      </td>
      <td className="p-4">
        <div className="bg-gray-300 rounded h-6 w-4/5" />
      </td>
      <td className="p-4">
        <div className="bg-gray-300 rounded h-6 w-2/5" />
      </td>
      <td className="p-4">
        <div className="bg-gray-300 rounded h-6 w-1/3" />
      </td>
      <td className="p-4">
        <div className="bg-gray-300 rounded h-6 w-2/5" />
      </td>
      <td className="p-4">
        <div className="bg-gray-300 rounded h-6 w-3/4" />
      </td>
      <td className="p-4">
        <div className="bg-gray-300 rounded h-6 w-2/4" />
      </td>
      <td className="p-4">
        <div className="bg-gray-300 rounded h-6 w-1/3" />
      </td>
      <td className="p-4">
        <div className="bg-gray-300 rounded h-6 w-1/3" />
      </td>
    </tr>
  );
};

export default SkeletonTableRow;
