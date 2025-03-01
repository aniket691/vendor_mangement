import React, { useEffect, useState } from 'react';
import { Card, CardContent, Grid, Typography, CircularProgress } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import jwtDecode from 'jwt-decode';
import { useNavigate } from "react-router-dom";
import axios from "axios";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Ddashinner = () => {
   const [data, setData] = useState(null);
  const [distributorData, setDistributorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [distributorId, setDistributorId] = useState(null);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [subcategoryCounts, setSubcategoryCounts] = useState({});
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();


  const API_BASE_URL = "https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/categories";
  const SUBCATEGORIES_API_URL = "https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/subcategories";
  const API_URL = "https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/statistics/cscounts";


  const defaultValues = {
    totalDocuments: 0,
    dailyDocumentCount: 0,
    totalUsers: 0,
    totalCompletedCertifiedUsers: 0,
    uploaded: 0,
    rejected: 0,
    pending: 0,
  };



  useEffect(() => {
      fetch("https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/statistics/counts")
        .then((res) => res.json())
        .then((result) => setData(result))
        .catch((err) => console.error("Error fetching data:", err));
    }, []);
  
    // Fetch category and subcategory counts
    useEffect(() => {
      fetchCategoryAndSubcategoryCounts();
    }, []);

    const fetchCategoryAndSubcategoryCounts = async () => {
      try {
        const response = await axios.get(API_URL);
        setCategoryCounts(response.data.categoryCounts);
        setSubcategoryCounts(response.data.subcategoryCounts);
      } catch (error) {
        console.error("Error fetching category and subcategory counts:", error);
      }
    };



  
    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const response = await axios.get(API_BASE_URL);
          setCategories(response.data);
        } catch (error) {
          console.error("Error fetching categories:", error);
        }
      };
      fetchCategories();
    }, []);
  
    // Fetch subcategories when a category is selected
    const fetchSubcategories = async (categoryId, categoryName) => {
      try {
        const response = await axios.get(SUBCATEGORIES_API_URL);
        const filteredSubcategories = response.data.filter(
          (sub) => sub.category.category_id === categoryId
        );
        setSubcategories(filteredSubcategories);
        setSelectedCategory({ categoryId, categoryName });
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };
  
    // Handle subcategory selection and navigate to ElistPage
    const handleSubcategorySelect = (subcategoryId, subcategoryName) => {
      if (!selectedCategory) {
        console.error("No category selected");
        return;
      }
  
      const { categoryId, categoryName } = selectedCategory;
  
      console.log("Category ID:", categoryId);
    console.log("Category Name:", categoryName);
    console.log("Subcategory ID:", subcategoryId);
    console.log("Subcategory Name:", subcategoryName);
      
      navigate("/DlistPage", {
        state: { categoryId, categoryName, subcategoryId, subcategoryName },
        
      });
    };
  
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setDistributorId(decodedToken.user_id);
      } catch (error) {
        console.error("Error decoding token:", error);
        setError('Failed to decode token');
      }
    } else {
      setError('Token not found');
    }
  }, []);

  useEffect(() => {
    if (distributorId) {
      setLoading(true);
      setError(null);
      fetch(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/statistics/distributor-counts/${distributorId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to fetch distributor data');
          }
          return res.json();
        })
        .then((data) => {
          setDistributorData(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching distributor data:', error);
          setError('Failed to fetch distributor data');
          setLoading(false);
        });
    }
  }, [distributorId]);


  const fetchNotifications = async () => {
    try {
      const response = await axios.get('https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/notifications/active');
      const distributorNotifications = response.data.filter(
        (notif) => notif.distributor_notification && notif.notification_status === 'Active'
      );
      setNotifications(distributorNotifications);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Typography variant="h6" color="error">
          Error: {error}
        </Typography>
      </div>
    );
  }

  if (!distributorId || !distributorData) {
    return <div>Error: Distributor data or ID not found</div>;
  }

  // Use default values if data is missing
  const totalDocuments = distributorData?.totalDocuments || defaultValues.totalDocuments;
  const dailyDocumentCount = distributorData?.dailyDocumentCounts?.[0]?.count || defaultValues.dailyDocumentCount;
  const totalUsers = distributorData?.totalUsers || defaultValues.totalUsers;
  const totalCompletedCertifiedUsers = distributorData?.totalCompletedCertifiedUsers || defaultValues.totalCompletedCertifiedUsers;

  const statusCounts = distributorData?.statusCounts || [];
  const statusData = {
    Uploaded: 0,
    Rejected: 0,
    Pending: 0,
  };

  statusCounts.forEach(item => {
    if (item.status === "Completed") statusData.Uploaded += parseInt(item.count);
    if (item.status === "Pending") statusData.Pending += parseInt(item.count);
    if (item.status === "Rejected") statusData.Rejected += parseInt(item.count);
  });

  // Ensure dailyCompletedCertifiedUsers is an array before using .reduce()
  const dailyCompletedCertifiedUsers = Array.isArray(distributorData?.dailyCompletedCertifiedUsers)
    ? distributorData.dailyCompletedCertifiedUsers
    : [];
  // Assuming distributorData has dailyStatusCounts that has daily counts for Uploaded, Pending, and Rejected
  const dailyStatusCounts = distributorData?.statusCounts?.reduce((acc, item) => {
    if (item.status === "Completed") acc.Uploaded += parseInt(item.count);
    if (item.status === "Pending") acc.Pending += parseInt(item.count);
    if (item.status === "Rejected") acc.Rejected += parseInt(item.count);
    return acc;
  }, { Uploaded: 0, Pending: 0, Rejected: 0 });

  const dailyCertifiedCount = dailyCompletedCertifiedUsers.length > 0
    ? dailyCompletedCertifiedUsers.reduce((total, user) => total + parseInt(user.count), 0)
    : defaultValues.totalCompletedCertifiedUsers;

  const barChartData = {
    labels: ['Uploaded', 'Rejected', 'Pending'],
    datasets: [{
      label: 'Status Counts',
      data: [
        statusData.Uploaded || 0,
        statusData.Rejected || 0,
        statusData.Pending || 0
      ],
      backgroundColor: ['green', 'red', 'orange'],
      borderColor: ['darkgreen', 'darkred', 'darkorange'],
      borderWidth: 1,
    }]
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-6 ml-[300px]">
     

      {/* <div className="w-full p-6"> */}
      

        <div className="w-full max-w-7xl bg-white p-6 shadow-lg">
        <div className="mb-6">
  {notifications.length > 0 &&
    notifications.map((notif, index) => (
      notif.distributor_notification && (
        <marquee key={index} className="text-lg font-semibold text-blue-600 mb-2">
          📢 {notif.distributor_notification}
        </marquee>
      )
    ))
  }
</div>
          <Grid container spacing={3}>

            {/* Cards for Total Documents, Total Users, Total Completed Certified Users */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Total Documents</Typography>
                    <Typography variant="h4">{totalDocuments}</Typography>
                  </CardContent>
                </Card>
              </Grid>



              <Grid item xs={12} sm={4} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Total Users</Typography>
                    <Typography variant="h4">{totalUsers}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={4} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Total Certified Users</Typography>
                    <Typography variant="h4">{totalCompletedCertifiedUsers}</Typography>
                  </CardContent>
                </Card>
              </Grid>




            </Grid>



            <h4 className="mt-8 text-xl font-semibold text-gray-700 ml-5">Application For Categories and Subcategories</h4>
      <div className="grid grid-cols-3 gap-4 w-full max-w-7xl mx-auto mt-4">
        {!selectedCategory ? (
          categories.map((category) => {
            const categoryCount = categoryCounts.find(
              (count) => count.categoryName === category.category_name
            )?.documentCount;

            return (
              <div
                key={category.category_id}
                className="flex flex-col items-center justify-center p-4 bg-white rounded shadow cursor-pointer"
                onClick={() => fetchSubcategories(category.category_id, category.category_name)}
              >
                <h3 className="text-lg font-semibold">{category.category_name}</h3>
                <p className="card-text"> ( {categoryCount || 0})</p>
              </div>
            );
          })
        ) : (
          subcategories.map((subcategory) => {
            const subcategoryCount = subcategoryCounts.find(
              (count) => count.subcategoryName === subcategory.subcategory_name
            )?.documentCount;

            return (
              <div
                key={subcategory.subcategory_id}
                className="flex items-center justify-center p-4 bg-white rounded shadow cursor-pointer"
                onClick={() => handleSubcategorySelect(subcategory.subcategory_id,subcategory.subcategory_name, selectedCategory.categoryName)}
              >
                <h3 className="text-lg font-semibold">{subcategory.subcategory_name}</h3>
                <p className="card-text">  ({subcategoryCount || 0})</p>
              </div>
            );
          })
        )}
      </div>


            {/* Bar Chart for Status Counts */}
            <Grid item xs={12} md={10}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Daily Status Counts</Typography>
                  <Bar
                    data={barChartData}
                    options={{
                      responsive: true,
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: function (tooltipItem) {
                              return `${tooltipItem.label}: ${tooltipItem.raw} items`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </div>
      </div>
 
  );
};

export default Ddashinner;
