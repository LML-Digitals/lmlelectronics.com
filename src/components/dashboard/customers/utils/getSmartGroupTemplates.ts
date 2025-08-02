// Function to get predefined smart group templates
export const getSmartGroupTemplates = () => {
  return [
    {
      name: 'Top Spenders',
      description: 'Customers who have spent over $1,000',
      filterCriteria: {
        criteria: [
          {
            field: 'totalSpent',
            operator: 'greaterThan',
            value: 1000,
          },
        ],
        conjunction: 'AND',
      },
    },
    {
      name: 'Frequent Visitors',
      description: 'Customers with more than 5 transactions',
      filterCriteria: {
        criteria: [
          {
            field: 'transactionCount',
            operator: 'greaterThan',
            value: 5,
          },
        ],
        conjunction: 'AND',
      },
    },
    {
      name: 'Recent Customers',
      description: 'Customers who visited in the last 30 days',
      filterCriteria: {
        criteria: [
          {
            field: 'lastVisit',
            operator: 'greaterThan',
            value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        ],
        conjunction: 'AND',
      },
    },
    {
      name: 'New Customers',
      description:
        'Customers who made their first purchase in the last 90 days',
      filterCriteria: {
        criteria: [
          {
            field: 'firstVisit',
            operator: 'greaterThan',
            value: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          },
        ],
        conjunction: 'AND',
      },
    },
  ];
};
