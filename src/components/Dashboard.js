import { styled } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { BarChart, PieChart } from "@mui/x-charts";
import {
  Autocomplete,
  Container,
  // FormControl,
  // InputLabel,
  // MenuItem,
  // Select,.
  TextField,
} from "@mui/material";
import Logo from "../img/Logo.jpg";
import { getDatabase, onValue, ref } from "firebase/database";
import {
  // LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  // Tooltip,
  // Legend,
  Area,
  ComposedChart,
} from "recharts";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  ...theme.applyStyles("dark", {
    backgroundColor: "#1A2027",
  }),
}));

function Dashboard() {
  // เมื่อเลือกทะเบียน
  // const handleChange = (event) => {
  //   setSelectedPlate(event.target.value);
  // };
  const handleStartDateChange = (newValue) => {
    setStartDate(newValue);
    if (newValue && endDate) {
      fetchData(newValue, endDate, selectedVehicle);
    }
  };

  const handleEndDateChange = (newValue) => {
    setEndDate(newValue);
    if (startDate && newValue) {
      fetchData(startDate, newValue, selectedVehicle);
    }
  };

  // const handleVehicleChange = (event) => {
  //   const selected = event.target.value;
  //   setSelectedVehicle(selected);
  //   if (startDate && endDate) {
  //     fetchData(startDate, endDate, selected);
  //   }
  // };

  // const [statusfree, setStatusfree] = useState(0);
  // const [statusproduct, setStatusproduct] = useState(0);
  // const [pending, setPending] = useState(0);
  // const [cancelled, setCancelled] = useState(0);
  // const [boardingstatus, setBoardingstatus] = useState(0);
  const [trips, setTrips] = useState(0);
  const [order, setOrder] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]); // สำหรับเก็บทะเบียนรถที่กรองแล้ว
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [sumVolume, setSumVolume] = useState(0);
  const [customer, setCustomer] = useState(0);
  const [addressCount, setAddressCount] = useState(0); // จำนวนจุดส่งสินค้า
  // const [plates, setPlates] = useState([]);
  // const [selectedPlate, setSelectedPlate] = useState("");
  const [monthlyTrips, setMonthlyTrips] = useState([]);
  const [succeed, setSucceed] = useState(0);
  const [wait, setWait] = useState(0);
  const [cancel, setCancel] = useState(0);
  const [o_wait, setO_wait] = useState(0);
  const [o_succeed, setO_succeed] = useState(0);
  const [o_trip, setO_trip] = useState(0);
  const [xAxisLabels, setXAxisLabels] = useState([]);
  const [xAxisDataKey, setXAxisDataKey] = useState([]);

  

  // ดึงข้อมูลทะเบียนรถทั้งหมดจาก Firebase
  useEffect(() => {
    const db = getDatabase();
    const vehicleRef = ref(db, "/primarydata/truck");

    onValue(vehicleRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const vehicleList = [
          ...new Set(Object.values(data).map((item) => item.ทะเบียนหัว)),
        ];
        setVehicles(vehicleList);
      }
    });
  }, []);

  // ดึงข้อมูลและกรองตามวันที่และทะเบียนรถ
  const fetchData = (start, end, vehicle) => {
    if (!start || !end) return;

    const db = getDatabase();
    const tripsRef = ref(db, "/operation");

    onValue(tripsRef, (snapshot) => {
      const datas = snapshot.val();
      const statusa = [];
      const statuss = [];
      const statusd = [];
      const dataTrips = [];
      const vehicleSet = new Set();
      let totalVolume = 0;

      for (let id in datas) {
        const tripDate = dayjs(datas[id].date, "DD/MM/YYYY");
        if (
          tripDate.isBetween(start, end, null, "[]") &&
          (vehicle === "" || datas[id].truck.split(":")[1] === vehicle)
        ) {
          dataTrips.push({ id, ...datas[id] });

          if (datas[id].status === "รออนุมัติ") {
            statusa.push({ id, ...datas[id] });
          } else if (datas[id].status === "อนุมัติ") {
            statuss.push({ id, ...datas[id] });
          } else {
            statusd.push({ id, ...datas[id] });
          }

          // เก็บทะเบียนรถ
          const tripVehicle = datas[id].truck.split(":")[1];
          vehicleSet.add(tripVehicle);

          // รวมปริมาณ volume
          totalVolume += Number(datas[id].sumvolume || 0);
        }
      }
      setO_wait(statusa.length);
      setO_succeed(statuss.length);
      setO_trip(statusd.length);
      setTrips(dataTrips.length);
      setSumVolume(totalVolume);
      setFilteredVehicles([...vehicleSet]);
    });

    // ดึงข้อมูลออเดอร์
    const orderRef = ref(db, "/order");
    onValue(orderRef, (snapshot) => {
      const datas = snapshot.val();
      const dataOrder = [];
      const dataOrderT = [];
      const dataOrderC = [];
      const uniqueCustomers = new Set();
      const uniqueAddresses = new Set();

      for (let id in datas) {
        const orderDate = dayjs(datas[id].date, "DD/MM/YYYY");
        if (
          orderDate.isBetween(start, end, null, "[]") &&
          (vehicle === "" || datas[id].truck.split(":")[1] === vehicle)
        ) {
          if (datas[id].orderstatus === "นำส่งสำเร็จ") {
            dataOrder.push({ id, ...datas[id] });
          } else if (datas[id].orderstatus === "รอจัดขึ้นรถ") {
            dataOrderT.push({ id, ...datas[id] });
          } else {
            dataOrderC.push({ id, ...datas[id] });
          }

          // เก็บลูกค้าและที่อยู่
          if (datas[id].customer) uniqueCustomers.add(datas[id].customer);
          if (datas[id].address) uniqueAddresses.add(datas[id].address);
        }
      }

      console.log("นำส่งสำเร็จ", dataOrder.length);
      console.log("รอจัดขึ้นรถ", dataOrderT.length);
      console.log("ยกเลิก", dataOrderC.length);

      setWait(dataOrderT.length);
      setCancel(dataOrderC.length);
      setSucceed(dataOrder.length);
      setOrder(dataOrder.length);
      setCustomer(uniqueCustomers.size);
      setAddressCount(uniqueAddresses.size);
    });
  };

  // // ดึงข้อมูลสถานะรถ
  // const getStatus = () => {
  //   const db = getDatabase();
  //   const vehicleRef = ref(db, "/primarydata/truck");

  //   onValue(vehicleRef, (snapshot) => {
  //     const datas = snapshot.val();
  //     const dataStatusfree = [];
  //     const dataStatusproduct = [];

  //     for (let id in datas) {
  //       if (datas[id].สถานะรถ === "ว่าง") {
  //         dataStatusfree.push({ id, ...datas[id] });
  //       } else {
  //         dataStatusproduct.push({ id, ...datas[id] });
  //       }
  //     }
  //     setStatusfree(dataStatusfree.length);
  //     setStatusproduct(dataStatusproduct.length);
  //   });
  // };

  // // ดึงข้อมูลสถานะออเดอร์
  // const getPending = () => {
  //   const db = getDatabase();
  //   const orderRef = ref(db, "/order");

  //   onValue(orderRef, (snapshot) => {
  //     const datas = snapshot.val();
  //     const dataPending = [];
  //     const dataBoardingstatus = [];
  //     const dataCancelled = [];

  //     for (let id in datas) {
  //       if (datas[id].orderstatus === "นำส่งสำเร็จ") {
  //         dataPending.push({ id, ...datas[id] });
  //       } else if (datas[id].orderstatus === "ยกเลิก") {
  //         dataCancelled.push({ id, ...datas[id] });
  //       } else {
  //         dataBoardingstatus.push({ id, ...datas[id] });
  //       }
  //     }

  //     setPending(dataPending.length);
  //     setBoardingstatus(dataBoardingstatus.length);
  //     setCancelled(dataCancelled.length);
  //   });
  // };

  useEffect(() => {
    if (!startDate || !endDate) {
      setMonthlyTrips([]);
      return;
    }

    const db = getDatabase();
    const tripsRef = ref(db, "/operation");

    onValue(tripsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const monthlyData = Array(12).fill(0); // ข้อมูลรายเดือน
        const dailyData = {}; // ข้อมูลรายวัน

        // กรองข้อมูลตามวันที่และทะเบียนรถ
        const filteredData = Object.values(data).filter((item) => {
          const orderDate = dayjs(item.date, "DD/MM/YYYY", true);
          if (!orderDate.isValid()) return false;

          const withinDateRange = orderDate.isBetween(
            dayjs(startDate),
            dayjs(endDate),
            null,
            "[]"
          );

          const matchesVehicle = selectedVehicle
            ? item.truck?.split(":")[1] === selectedVehicle
            : true;

          return withinDateRange && matchesVehicle;
        });

        filteredData.forEach((trip) => {
          const tripDate = dayjs(trip.date, "DD/MM/YYYY", true);
          if (!tripDate.isValid()) return;

          // ถ้าอยู่ในเดือนเดียวกัน -> รวมตามวันที่
          const tripDay = tripDate.format("DD/MM"); // ใช้วันที่เต็มในกรณีข้ามเดือน
          dailyData[tripDay] = (dailyData[tripDay] || 0) + 1;

          // ถ้าข้ามเดือน -> รวมตามเดือน
          if (dayjs(startDate).month() !== dayjs(endDate).month()) {
            const tripMonth = tripDate.month();
            monthlyData[tripMonth] += 1;
          }
        });

        let formattedData;
        let xAxisDataKey;
        let xAxisLabels;

        // ตรวจสอบระยะเวลาของช่วงวันที่
        const startMonth = dayjs(startDate).month();
        const endMonth = dayjs(endDate).month();
        const monthDifference = endMonth - startMonth;

        const daysDifference = dayjs(endDate).diff(dayjs(startDate), "days");

        if (daysDifference > 31) {
          // ถ้าช่วงวันที่เกิน 2 เดือน (60 วัน) แสดงเป็นรายเดือน
          formattedData = monthlyData.map((value, index) => ({
            month: [
              "ม.ค.",
              "ก.พ.",
              "มี.ค.",
              "เม.ย.",
              "พ.ค.",
              "มิ.ย.",
              "ก.ค.",
              "ส.ค.",
              "ก.ย.",
              "ต.ค.",
              "พ.ย.",
              "ธ.ค.",
            ][index],
            trips: value,
          }));
          xAxisDataKey = "month"; // Set key as 'month' for monthly data
          xAxisLabels = formattedData.map((data) => data.month);
        } else {
          // ถ้าเป็นช่วงวันที่ไม่เกิน 2 เดือน แสดงเป็นรายวัน
          formattedData = Object.keys(dailyData).map((date) => ({
            day: date, // แสดงเป็นวัน (เช่น 25/12/2024, 26/12/2024, ...)
            trips: dailyData[date],
          }));
          xAxisDataKey = "day"; // Set key as 'day' for daily data
          xAxisLabels = formattedData.map((data) => data.day);
        }

        setMonthlyTrips(formattedData);

        // Update the X-Axis label dynamically
        setXAxisLabels(xAxisLabels);
        setXAxisDataKey(xAxisDataKey);
      }
    });
  }, [selectedVehicle, startDate, endDate]);
  // const [volu, setVolu] = useState(0); // เก็บค่ารวม sumvolume

  // useEffect(() => {
  //   const db = getDatabase(); // เรียกใช้งาน Firebase Realtime Database
  //   const tripsRef = ref(db, "/operation"); // ชี้ไปที่ path "/operation"

  //   const unsubscribe = onValue(tripsRef, (snapshot) => {
  //     const datas = snapshot.val();
  //     if (datas) {
  //       // รวมค่าจากฟิลด์ sumvolume
  //       const totalVolume = Object.values(datas).reduce((acc, item) => {
  //         const volume = parseFloat(item?.sumvolume) || 0; // ตรวจสอบว่ามีค่า sumvolume และแปลงเป็นตัวเลข
  //         return acc + volume;
  //       }, 0);

  //       setVolu(totalVolume); // อัปเดตค่า volu ด้วยผลรวม
  //     } else {
  //       setVolu(0); // หากไม่มีข้อมูล ตั้งค่า volu เป็น 0
  //     }
  //   });

  //   return () => unsubscribe(); // ปิดการเชื่อมต่อเมื่อ component ถูกทำลาย
  // }, []);

  // const getStatus = async () => {
  //   database.ref("/primarydata/truck").on("value", (snapshot) => {
  //     const datas = snapshot.val();
  //     const dataStatusfree = [];
  //     const dataStatusproduct = [];

  //     for (let id in datas) {
  //       if (datas[id].สถานะรถ === "ว่าง") {
  //         dataStatusfree.push({ id, ...datas[id] });
  //       } else {
  //         dataStatusproduct.push({ id, ...datas[id] });
  //       }
  //     }
  //     setStatusfree(dataStatusfree.length);
  //     setStatusproduct(dataStatusproduct.length);
  //   });
  // };

  // const getPending = async () => {
  //   database.ref("/order").on("value", (snapshot) => {
  //     const datas = snapshot.val();
  //     const dataPending = [];
  //     const dataBoardingstatus = [];
  //     const dataCancelled = []; // ตัวแปรสำหรับเก็บข้อมูลสถานะ "ยกเลิก"

  //     for (let id in datas) {
  //       if (datas[id].orderstatus === "นำส่งสำเร็จ") {
  //         dataPending.push({ id, ...datas[id] });
  //       } else if (datas[id].orderstatus === "ยกเลิก") {
  //         dataCancelled.push({ id, ...datas[id] }); // เก็บข้อมูลที่สถานะเป็น "ยกเลิก"
  //       } else {
  //         dataBoardingstatus.push({ id, ...datas[id] });
  //       }
  //     }

  //     setPending(dataPending.length); // จำนวนสถานะ "นำส่งสำเร็จ"
  //     setBoardingstatus(dataBoardingstatus.length); // จำนวนสถานะอื่น ๆ
  //     setCancelled(dataCancelled.length); // จำนวนสถานะ "ยกเลิก"
  //   });
  // };

  // useEffect(() => {
  //   getPending();
  // }, []);

  // const [alltp, setAlltp] = useState([]);

  // const getAlltp = async () => {
  //   database.ref("/operation").on("value", (snapshot) => {
  //     const datas = snapshot.val();
  //     setAlltp(datas.length);
  //   });
  // };

  // const [coot, setCoot] = useState(0);

  // const getCoot = async () => {
  //   const db = getDatabase();
  //   const refCustomers = ref(db, "/primarydata/customersid");

  //   onValue(refCustomers, (snapshot) => {
  //     const datas = snapshot.val();
  //     if (datas) {
  //       // ใช้ Set เพื่อตัดค่าซ้ำ
  //       const uniqueKeys = new Set(
  //         Object.keys(datas).filter(
  //           (key) => datas[key] !== null && datas[key] !== undefined
  //         )
  //       );
  //       setCoot(uniqueKeys.size); // จำนวนข้อมูลไม่ซ้ำ
  //     } else {
  //       setCoot(0); // กรณีที่ไม่มีข้อมูล
  //     }
  //   });
  // };

  // const [custom, setCustom] = useState(0); // จำนวนจุดส่งสินค้า

  // useEffect(() => {
  //   const db = getDatabase(); // เรียกใช้ Firebase Realtime Database
  //   const orderRef = ref(db, "/order"); // ดึงข้อมูลจาก path "/order"

  //   // ดึงข้อมูลจาก Firebase
  //   const unsubscribe = onValue(orderRef, (snapshot) => {
  //     const datas = snapshot.val();

  //     if (datas) {
  //       const deliveryPoints = new Set(); // สร้าง Set เพื่อเก็บจุดส่งสินค้า

  //       for (let id in datas) {
  //         const order = datas[id];
  //         const customer = order?.customer; // ดึงข้อมูล customer จากแต่ละ order
  //         const orderStatus = order?.orderstatus; // ดึงข้อมูล orderstatus

  //         // ตรวจสอบเงื่อนไข: เฉพาะสถานะ "นำส่งสำเร็จ"
  //         if (orderStatus === "นำส่งสำเร็จ" && customer) {
  //           deliveryPoints.add(customer); // เพิ่ม customer ลงใน Set
  //         }
  //       }

  //       setCustom(deliveryPoints.size); // อัปเดตจำนวนจุดส่งสินค้าจาก Set
  //     }
  //   });

  //   // Return ฟังก์ชันเพื่อ unsubscribe เมื่อ component ถูกทำลาย
  //   return () => unsubscribe();
  // }, []); // ดึงข้อมูลเมื่อ component ถูกโหลด

  // const [plates, setPlates] = useState([]);
  // const [selectedPlate, setSelectedPlate] = useState("");
  // const [monthlyTrips, setMonthlyTrips] = useState([]);

  // useEffect(() => {
  //   const db = getDatabase();
  //   const tripsRef = ref(db, "/operation");

  //   const unsubscribe = onValue(tripsRef, (snapshot) => {
  //     const data = snapshot.val();
  //     if (data) {
  //       const uniquePlates = new Set();
  //       data.forEach((item) => {
  //         const plate = item.truck.split(":")[1];
  //         uniquePlates.add(plate);
  //       });
  //       setPlates([...uniquePlates]);
  //     }
  //   });

  //   return () => unsubscribe();
  // }, []);

  // useEffect(() => {
  //   const db = getDatabase();
  //   const tripsRef = ref(db, "/operation");

  //   const unsubscribe = onValue(tripsRef, (snapshot) => {
  //     const data = snapshot.val();
  //     if (data) {
  //       const monthlyData = Array(12).fill(0);

  //       // กรองข้อมูลตามทะเบียนหากเลือก หรือไม่กรองหากเลือก "ทั้งหมด"
  //       const filteredData = selectedPlate
  //         ? data.filter((item) => item.truck.includes(selectedPlate))
  //         : data;

  //       filteredData.forEach((trip) => {
  //         const tripMonth = new Date(trip.date).getMonth();
  //         monthlyData[tripMonth] += 1;
  //       });

  //       // แปลงข้อมูลให้เหมาะกับ Recharts
  //       const formattedData = monthlyData.map((value, index) => ({
  //         month: [
  //           "ม.ค.",
  //           "ก.พ.",
  //           "มี.ค.",
  //           "เม.ย.",
  //           "พ.ค.",
  //           "มิ.ย.",
  //           "ก.ค.",
  //           "ส.ค.",
  //           "ก.ย.",
  //           "ต.ค.",
  //           "พ.ย.",
  //           "ธ.ค.",
  //         ][index],
  //         trips: value,
  //       }));

  //       setMonthlyTrips(formattedData);
  //     }
  //   });

  //   return () => unsubscribe();
  // }, [selectedPlate]);

  // useEffect(() => {
  //   getStatus();
  //   // getPending();
  //   // getAlltp();
  //   // getCoot();
  // }, []);

  // console.log(statusfree);
  // console.log(statusproduct);

  // useEffect(() => {
  //   document.body.style.zoom = "100%"; // กำหนดให้หน้าจอซูม 100%
  // }, []);

  return (
    <Container maxWidth="xl">
      <Box p={3}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "left",
            alignItems: "center",
            marginTop: -30,
            marginBottom: 4,
          }}
        >
          <img
            src={Logo}
            alt="Logo"
            style={{ width: "150px", marginLeft: -46 }}
          />
          <Typography
            variant="h3"
            fontWeight="bold"
            color="success"
            gutterBottom
            marginLeft={0}
            marginTop={3}
          >
            Happy
          </Typography>

          <Typography
            variant="h3"
            fontWeight="bold"
            color="warning"
            gutterBottom
            marginLeft={3}
            marginTop={3}
          >
            Oil
          </Typography>

          <Typography
            variant="h3"
            fontWeight="bold"
            color="red"
            gutterBottom
            marginLeft={3}
            marginTop={3}
          >
            Group
          </Typography>
        </Box>
        <Grid container spacing={2} marginBottom={2} marginLeft={-3.6}>
          <Grid item xs={1.6}>
            <Paper component="form">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  views={["year", "month", "day"]}
                  label="วันที่เริ่มต้น"
                  value={startDate}
                  format="DD/MM/YYYY"
                  onChange={handleStartDateChange}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }}
                />
              </LocalizationProvider>
            </Paper>
          </Grid>
          <Grid item xs={1.6}>
            <Paper component="form">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  views={["year", "month", "day"]}
                  label="วันที่สิ้นสุด"
                  value={endDate}
                  format="DD/MM/YYYY"
                  onChange={handleEndDateChange}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }}
                />
              </LocalizationProvider>
            </Paper>
          </Grid>
          <Grid item xs={1.9}>
            <Paper component="form">
              <Autocomplete
                size="small"
                fullWidth
                options={filteredVehicles}
                getOptionLabel={(option) => option || ""}
                value={selectedVehicle}
                onChange={(event, newValue) => {
                  setSelectedVehicle(newValue || "");
                  if (startDate && endDate) {
                    fetchData(startDate, endDate, newValue || "");
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="เลือกทะเบียนรถ"
                    variant="outlined"
                  />
                )}
              />
            </Paper>
          </Grid>
        </Grid>
        <Grid container spacing={2.2}>
          <Grid item xs={2}>
            <Item
              sx={{
                height: 60,
                alignItems: "center",
                display: "flex",
                justifyContent: "center",
                backgroundColor: "#FF2929",
                color: "white",
                borderRadius: 5,
                marginLeft: -2,
                marginRight: 1,
              }}
            >
              <Box
                textAlign="right"
                borderRight={2}
                paddingRight={1}
                marginRight={1}
                paddingTop={1}
              >
                <Typography variant="" gutterBottom>
                  จำนวนเที่ยว
                </Typography>
                {/* <Typography variant="h5" gutterBottom>
                  วันนี้
                </Typography> */}
              </Box>
              <Typography
                sx={{
                  fontSize: 35,
                }}
              >
                {trips}
              </Typography>
            </Item>
          </Grid>

          <Grid item xs={2.3}>
            <Item
              sx={{
                height: 60,
                alignItems: "center",
                display: "flex",
                justifyContent: "center",
                backgroundColor: "#FF2929",
                color: "white",
                borderRadius: 5,
                marginLeft: -2,
                marginRight: 1,
              }}
            >
              <Box
                textAlign="right"
                borderRight={2}
                paddingRight={1}
                marginRight={1}
                paddingTop={1}
              >
                <Typography variant="" gutterBottom>
                  จำนวนออเดอร์
                </Typography>
                {/* <Typography variant="h5" gutterBottom>
                  วันนี้
                </Typography> */}
              </Box>
              <Typography
                sx={{
                  fontSize: 35,
                }}
              >
                {order}
              </Typography>
            </Item>
          </Grid>

          <Grid item xs={1.7}>
            <Item
              sx={{
                height: 60,
                alignItems: "center",
                display: "flex",
                justifyContent: "center",
                backgroundColor: "#FF2929",
                color: "white",
                borderRadius: 5,
                marginLeft: -2,
                marginRight: 1,
              }}
            >
              <Box
                textAlign="right"
                borderRight={2}
                paddingRight={1}
                marginRight={1}
                paddingTop={1}
              >
                <Typography variant="" gutterBottom>
                  ลูกค้า
                </Typography>
                {/* <Typography variant="h6" gutterBottom>
                  ท้ังหมด
                </Typography> */}
              </Box>
              <Typography
                sx={{
                  fontSize: 35,
                }}
              >
                {customer.toLocaleString()}
              </Typography>
            </Item>
          </Grid>

          <Grid item xs={3}>
            <Item
              sx={{
                height: 60,
                alignItems: "center",
                display: "flex",
                justifyContent: "center",
                backgroundColor: "#FF2929",
                color: "white",
                borderRadius: 5,
                marginLeft: -2,
              }}
            >
              <Box
                textAlign=""
                borderRight={2}
                paddingRight={1}
                marginRight={1}
                paddingTop={2}
              >
                <Typography variant="subtitle1" gutterBottom>
                  ปริมาณ
                </Typography>
                {/* <Typography variant="h5" gutterBottom>
                  วันนี้
                </Typography> */}
              </Box>
              <Typography
                sx={{
                  fontSize: 35,
                }}
              >
                {sumVolume.toLocaleString()}
              </Typography>
            </Item>
          </Grid>

          <Grid item xs={3}>
            <Item
              sx={{
                height: 60,
                alignItems: "center",
                display: "flex",
                justifyContent: "center",
                backgroundColor: "#8FD14F",
                color: "white",
                borderRadius: 5,
              }}
            >
              <Box
                textAlign="right"
                borderRight={2}
                paddingRight={1}
                marginRight={1}
                paddingTop={1}
              >
                <Typography variant="button" gutterBottom>
                  จำนวนจุดส่งสินค้า
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: 50,
                }}
              >
                {addressCount}
              </Typography>
            </Item>
          </Grid>
        </Grid>
      </Box>

      <Paper sx={{ margin: 2, backgroundColor: "lightgrey", p: 3 }}>
        <Typography variant="h5" textAlign="center">
          กราฟเเสดงข้อมูลทั้งหมด
        </Typography>
        <Grid container spacing={5} marginTop={-9}>
          <Grid item xs={0.7}></Grid>
          <Grid xs={2.5}>
            <Item sx={{ marginTop: 10 }}>
              <Typography variant="h6" color="#000000">
                สถานะรถ
              </Typography>
              <Box>
                <PieChart
                  width={335}
                  height={400}
                  series={[
                    {
                      data: [
                        {
                          id: "อนุมัติ",
                          color: "#2979ff",
                          value: o_succeed,
                        },
                        {
                          id: "รออนุมัติ",
                          color: "#ffea00",
                          value: o_wait,
                        },
                        {
                          id: "จบทริป",
                          color: "#52b202",
                          value: o_trip,
                        },
                      ],
                      type: "pie",
                      arcLabel: "label",
                    },
                  ]}
                />
              </Box>
              <Box display="flex" justifyContent="center" alignItems="center">
                <Box
                  width={15}
                  height={15}
                  sx={{
                    backgroundColor: "#ffea00",
                    marginRight: 1,
                    marginTop: -8,
                  }}
                />
                <Typography
                  marginTop={-8}
                  marginRight={1}
                  color="#000000"
                  fontSize={12}
                >
                  รออนุมัติ
                </Typography>
                <Box
                  width={15}
                  height={15}
                  sx={{
                    backgroundColor: "#2979ff",
                    marginRight: 1,
                    marginTop: -8,
                  }}
                />
                <Typography
                  marginTop={-8}
                  marginRight={1}
                  color="#000000"
                  fontSize={12}
                >
                  อนุมัติ
                </Typography>
                <Box
                  width={15}
                  height={15}
                  sx={{
                    backgroundColor: "#52b202",
                    marginRight: 1,
                    marginTop: -8,
                  }}
                />
                <Typography marginTop={-8} color="#000000" fontSize={12}>
                  จบทริป
                </Typography>
              </Box>
            </Item>
          </Grid>
          <Grid xs={0.3}></Grid>
          <Grid xs={5.5}>
            <Item sx={{ marginTop: 10, paddingRight: -5 }}>
              <BarChart
                xAxis={[
                  {
                    data: [
                      "จำนวนเที่ยว",
                      // "ปริมาณ",
                      "ลูกค้า",
                      "จำนวนจุดส่งสินค้า",
                    ],
                    scaleType: "band",
                  },
                ]}
                series={[
                  {
                    data: [trips, customer, addressCount],
                    stack: "A",
                    color: "#009688",
                  },
                ]}
                barLabel={(item, context) => {
                  return context.bar.height < 60
                    ? null
                    : item.value?.toString();
                }}
                height={433}
              />
            </Item>
          </Grid>
          <Grid xs={0.3}></Grid>
          <Grid xs={2.5}>
            <Item sx={{ marginTop: 10 }}>
              <Typography variant="h6" color="#000000">
                สถานะสินค้า
              </Typography>
              <Box>
                <PieChart
                  width={335}
                  height={400}
                  series={[
                    {
                      data: [
                        {
                          id: "รอจัดขึ้นรถ",
                          color: "#ffea00",
                          value: wait,
                        },
                        {
                          id: "ยกเลิก",
                          color: "#FF2929",
                          value: cancel,
                        },
                        {
                          id: "นำส่งสำเร็จ",
                          color: "#52b202",
                          value: succeed,
                        },
                      ],
                      type: "pie",
                      arcLabel: "label",
                    },
                  ]}
                />
                <Grid>
                  <Box>
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Box
                        width={15}
                        height={15}
                        sx={{
                          backgroundColor: "#ffea00",
                          marginRight: 1,
                          marginTop: -8,
                        }}
                      />
                      <Typography
                        marginTop={-8}
                        marginRight={3}
                        color="#000000"
                        fontSize={12}
                      >
                        รอจัดขึ้นรถ
                      </Typography>
                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Box
                          width={15}
                          height={15}
                          sx={{
                            backgroundColor: "#FF2929",
                            marginRight: 1,
                            marginTop: -8,
                          }}
                        />
                        <Typography
                          marginTop={-8}
                          marginRight={3}
                          color="#000000"
                          fontSize={12}
                        >
                          ยกเลิก
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={2} />
                <Grid>
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Box
                      width={15}
                      height={15}
                      sx={{
                        backgroundColor: "#52b202",
                        marginLeft: -12.8,
                        marginTop: -3,
                      }}
                    />
                    <Typography
                      marginTop={-3}
                      color="#000000"
                      fontSize={12}
                      paddingLeft={1}
                    >
                      นำส่งสำเร็จ
                    </Typography>
                  </Box>
                </Grid>
              </Box>
            </Item>
          </Grid>
        </Grid>
        <Grid sx={{ marginTop: 9 }}></Grid>
      </Paper>

      <Paper
        sx={{
          margin: 2,
          backgroundColor: "lightgrey",
          padding: 3,
          display: "flex", // ✅ จัดให้อยู่ตรงกลาง
          justifyContent: "center", // ✅ ไม่ให้ขยับ
          alignItems: "center",
          overflow: "hidden", // ✅ ป้องกันล้น
          position: "relative", // ✅ ล็อกตำแหน่ง
        }}
      >
        <Grid container justifyContent="center">
          <Typography variant="h5" textAlign="center" marginTop={2}>
            กราฟแสดงจำนวนเที่ยว
          </Typography>
          <Item
          sx={{
            width: "100%",
            maxWidth: "1200px", // ✅ ไม่ให้เกิน 1250px
            overflow: "hidden", // ✅ ป้องกันล้น
            position: "relative", // ✅ ป้องกันการขยับ
            justifyContent: "center", // ✅ จัดให้อยู่ตรงกลาง
          }}
          >
            <Box
              // sx={{
              //   width: "100%",
              //   maxWidth: "1200px", // ✅ ขนาดคงที่
              //   overflow: "hidden", // ✅ ป้องกันทะลุ
              //   position: "relative",
              // }}
            >
              <ComposedChart
                width={1170} // ✅ ขนาดตายตัว
                height={500}
                data={monthlyTrips}
                margin={{ left: -20, right: 30, top: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={xAxisDataKey}
                  fontSize={15}
                  ticks={xAxisLabels}
                />
                <YAxis fontSize={13} />
                <Area
                  type="monotone"
                  dataKey="trips"
                  stroke="#FF5733"
                  fill="rgba(255, 87, 51, 0.5)"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="trips"
                  stroke="#FF5733"
                  strokeWidth={3}
                  activeDot={{ r: 10 }}
                  label={({ x, y, value }) => (
                    <text
                      x={x}
                      y={y - 10}
                      fill="black"
                      textAnchor="middle"
                      fontSize={20}
                    >
                      {value}
                    </text>
                  )}
                />
              </ComposedChart>
            </Box>
          </Item>
        </Grid>
      </Paper>
    </Container>
  );
}
export default Dashboard;
