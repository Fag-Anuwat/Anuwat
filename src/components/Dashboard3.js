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
import { Autocomplete, Button, Container, TextField } from "@mui/material";
import Teble from "./Teble";
import { BarChart, PieChart } from "@mui/x-charts";
import { getDatabase, ref, onValue } from "firebase/database";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
// } from "recharts";
import { database } from "./server/firebase";
import { Cancel } from "@mui/icons-material";

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

function Dashboard3(props) {
  const { seller } = props;
  const [show, setShow] = React.useState(0);
  const [sellernumber, setsellernumber] = useState(0); // จำนวนสินค้าของ seller
  const [totalVolume, setTotalVolume] = useState(0); // ปริมาณรวมของ seller
  const [startDate, setStartDate] = useState(null); // วันที่เริ่มต้น
  const [endDate, setEndDate] = useState(null); // วันที่สิ้นสุด
  const [selectedPlate, setSelectedPlate] = useState(""); // ทะเบียนที่เลือก
  const [filteredPlates, setFilteredPlates] = useState([]); // รายการทะเบียนที่กรองตามวันที่
  const [selectedCustomer, setSelectedCustomer] = useState(""); // ลูกค้าที่เลือก
  const [filteredCustomers, setFilteredCustomers] = useState([]); // รายการลูกค้าที่กรองตามวันที่
  // const [monthlyTrips, setMonthlyTrips] = useState(0);
  const [tripCount, setTripCount] = useState(0);
  const [f_wait, setF_wait] = useState(0);
  const [f_cancel, setF_cancel] = useState(0);
  const [tripCount1, setTripCount1] = useState(0);
  const [tripCount2, setTripCount2] = useState(0);

  console.log("Seller (Logged in): ", seller);

  // ดึงข้อมูลสำหรับ Seller
  const getSeller = async (start, end, plate, customer) => {
    if (!start || !end) return;

    // const database = getDatabase();
    const orderRef = ref(database, "/order");
    const operationRef = ref(database, "/operation");

    onValue(orderRef, (snapshot) => {
      const datas = snapshot.val();
      console.log("datas : ", datas.length);
      console.log("seller : ", seller.toString());
      const dataList = [];
      const data1 = [];
      const data2 = [];
      const plateList = new Set();
      const customerList = new Set();
      let volumeSum = 0;

      // ดึงข้อมูล order
      for (let id in datas) {
        const orderDate = dayjs(datas[id]?.date, "DD/MM/YYYY");

        if (
          datas[id]?.orderseller === seller.toString() &&
          orderDate.isBetween(start, end, null, "[]") &&
          (plate === "" || datas[id]?.truck === plate) &&
          (customer === "" || datas[id]?.customer === customer)
        ) {
          if (datas[id].orderstatus === "นำส่งสำเร็จ") {
            dataList.push({ id, ...datas[id] });
          } else if (datas[id].orderstatus === "รอจัดขึ้นรถ") {
            data1.push({ id, ...datas[id] });
          }
          if (datas[id].orderstatus === "ยกเลิก") {
            data2.push({ id, ...datas[id] });
          }

          if (datas[id]?.truck) plateList.add(datas[id].truck);
          if (datas[id]?.customer) customerList.add(datas[id].customer);
          volumeSum += parseFloat(datas[id]?.volume || 0);
        }
      }

      console.log("showdataList: ", dataList.length);

      // ตรวจสอบ operation และนับจำนวนเที่ยวที่ตรงกับ order
      onValue(operationRef, (operationSnapshot) => {
        const operationData = operationSnapshot.val();
        // let tripCount = 0;
        const matchingOperations = []; // Array สำหรับเก็บ ID ของ operation ที่ตรงกัน
        const matchingOperations1 = []; // Array สำหรับเก็บ ID ของ operation ที่ตรงกัน
        const matchingOperations2 = []; // Array สำหรับเก็บ ID ของ operation ที่ตรงกัน
        for (let operationId in operationData) {
          if (operationData[operationId].status === "จบทริป") {
            const operation = operationData[operationId];
            // ตรวจสอบฟิลด์ CH1 ถึง CH8
            for (let i = 1; i <= 8; i++) {
              const chField = `CH${i}`;
              if (
                operation[chField] &&
                dataList.some((order) => order.id === operation[chField])
              ) {
                matchingOperations.push(operationId); // บันทึก ID ของ operation ที่ตรงกัน
                break; // ไม่ต้องตรวจซ้ำใน operation เดียวกัน
              }
            }
          } else if (operationData[operationId].status === "รออนุมัติ") {
            const operation = operationData[operationId];
            // ตรวจสอบฟิลด์ CH1 ถึง CH8
            for (let i = 1; i <= 8; i++) {
              const chField = `CH${i}`;
              if (
                operation[chField] &&
                dataList.some((order) => order.id === operation[chField])
              ) {
                matchingOperations1.push(operationId); // บันทึก ID ของ operation ที่ตรงกัน
                break; // ไม่ต้องตรวจซ้ำใน operation เดียวกัน
              }
            }
          }
          if (operationData[operationId].status === "อนุมัติ") {
            const operation = operationData[operationId];
            // ตรวจสอบฟิลด์ CH1 ถึง CH8
            for (let i = 1; i <= 8; i++) {
              const chField = `CH${i}`;
              if (
                operation[chField] &&
                dataList.some((order) => order.id === operation[chField])
              ) {
                matchingOperations2.push(operationId); // บันทึก ID ของ operation ที่ตรงกัน
                break; // ไม่ต้องตรวจซ้ำใน operation เดียวกัน
              }
            }
          }
        }
        console.log("Matching Operations:", matchingOperations.length);
        // ตั้งค่าข้อมูล state
        setF_cancel(data2.length);
        setF_wait(data1.length);
        setsellernumber(dataList.length); // จำนวนออร์เดอร์
        setTotalVolume(volumeSum); // ปริมาณรวม
        setFilteredPlates([...plateList]); // รายการทะเบียนรถ
        setFilteredCustomers([...customerList]); // รายชื่อลูกค้า
        setTripCount(matchingOperations.length); // จำนวนเที่ยวที่ตรวจสอบได้
        setTripCount1(matchingOperations1.length); // จำนวนเที่ยวที่ตรวจสอบได้
        setTripCount2(matchingOperations2.length); // จำนวนเที่ยวที่ตรวจสอบได้
      });
    });
  };

  // useEffect(() => {
  //   const database = getDatabase();
  //   const tripsRef = ref(database, "/operation");

  //   onValue(tripsRef, (snapshot) => {
  //     const data = snapshot.val();
  //     if (data) {
  //       const monthlyData = Array(12).fill(0);

  //       // ดึงรายการ order ที่ผ่านการกรองมาใช้งาน
  //       const dataList = []; // ควรอัปเดต dataList จากฟังก์ชัน getSeller() หรือแหล่งข้อมูลที่ตรงกัน

  //       // กรองข้อมูล operation ตาม seller, selectedPlate, selectedCustomer และต้องตรวจสอบ CH1-CH8
  //       const filteredData = Object.values(data).filter((operation) => {
  //         // ตรวจสอบเงื่อนไขเบื้องต้น
  //         const isMatchingSeller = operation.orderseller === seller.toString();
  //         const isMatchingPlate = selectedPlate ? operation.truck.includes(selectedPlate) : true;
  //         const isMatchingCustomer = selectedCustomer ? operation.customer === selectedCustomer : true;

  //         // ตรวจสอบว่ามี Order ID ใน CH1 - CH8 ที่ตรงกับ dataList หรือไม่
  //         const isMatchingOrder = (() => {
  //           for (let i = 1; i <= 8; i++) {
  //             const chField = `CH${i}`;
  //             if (operation[chField] && dataList.some((order) => order.id === operation[chField])) {
  //               return true;
  //             }
  //           }
  //           return false;
  //         })();

  //         return isMatchingSeller && isMatchingPlate && isMatchingCustomer && isMatchingOrder;
  //       });

  //       // รวมจำนวนเที่ยวต่อเดือน
  //       filteredData.forEach((trip) => {
  //         const tripMonth = new Date(trip.date).getMonth(); // ดึงเดือนจากวันที่
  //         monthlyData[tripMonth] += 1;
  //       });

  //       // จัดรูปแบบข้อมูลกราฟ
  //       const formattedData = monthlyData.map((value, index) => ({
  //         month: [
  //           "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  //           "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
  //         ][index],
  //         trips: value,
  //       }));

  //       setMonthlyTrips(formattedData); // อัปเดตข้อมูลกราฟ
  //     }
  //   });
  // }, [seller, selectedPlate, selectedCustomer]); // Include seller as dependency

  // ดึงข้อมูล Seller เมื่อมีการเปลี่ยนแปลงของวันที่หรือเงื่อนไข
  useEffect(() => {
    if (startDate && endDate) {
      getSeller(startDate, endDate, selectedPlate, selectedCustomer);
    }
  }, [startDate, endDate, selectedPlate, selectedCustomer]);

  return (
    <Container maxWidth="xl">
      <Typography textAlign="center" marginBottom={5} variant="h3">
        Seller{seller}
        {/* {
          seller.map((row) => (
            row.salename
          ))
        } */}
      </Typography>
      <div className="Dashboard">
        {show === 1 ? (
          <>
            <Box textAlign={"right"} marginBottom={62} paddingRight={8}>
              <Button
                sx={{ marginRight: 2 }}
                variant="contained"
                size="large"
                onClick={() => setShow(0)}
              >
                กลับ
              </Button>
            </Box>
            <Teble></Teble>
          </>
        ) : (
          <>
            {/* <Box>
              <Button
                variant="contained"
                size="large"
                onClick={() => setShow(1)}
              >
                เเสดงรายงานข้อมูลเซลล์
              </Button>
            </Box> */}

            <Box>
              <Grid container spacing={2}>
                <Grid item xs={1.6} margin={2} marginRight={-3}>
                  <Paper component="form">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        views={["year", "month", "day"]}
                        label="วันที่เริ่มต้น"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        format="DD/MM/YYYY"
                        slotProps={{
                          textField: { size: "small", fullWidth: true },
                        }}
                      />
                    </LocalizationProvider>
                  </Paper>
                </Grid>
                <Grid item xs={1.6} margin={2}>
                  <Paper component="form">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        views={["year", "month", "day"]}
                        label="วันที่สิ้นสุด"
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        format="DD/MM/YYYY"
                        slotProps={{
                          textField: { size: "small", fullWidth: true },
                        }}
                      />
                    </LocalizationProvider>
                  </Paper>
                </Grid>

                {/* เลือกทะเบียน */}
                <Grid item xs={3} margin={2} marginLeft={-3}>
                  <Paper component="form">
                    <Autocomplete
                      options={filteredPlates}
                      getOptionLabel={(option) =>
                        option === "" ? "ทั้งหมด" : option
                      }
                      value={selectedPlate}
                      onChange={(event, newValue) => {
                        setSelectedPlate(newValue || "");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="เลือกทะเบียน"
                          size="small"
                          fullWidth
                        />
                      )}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={2.6} margin={2} marginLeft={-3}>
                  <Paper component="form">
                    <Autocomplete
                      options={filteredCustomers} // ใช้รายการลูกค้าที่กรองแล้ว
                      getOptionLabel={(option) =>
                        option === "" ? "ทั้งหมด" : option
                      } // แปลงค่า "ทั้งหมด" ให้แสดงได้
                      value={selectedCustomer} // ค่าเริ่มต้นที่เลือก
                      onChange={(event, newValue) => {
                        setSelectedCustomer(newValue || ""); // อัปเดตค่าเมื่อมีการเลือก
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="เลือกลูกค้า"
                          size="small"
                          fullWidth
                        />
                      )}
                    />
                  </Paper>
                </Grid>
                <Grid container spacing={3} marginLeft={4}>
                  <Grid item xs={3.5}>
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
                        <Typography variant="subtitle1" gutterBottom>
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
                        {tripCount}
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
                        <Typography variant="subtitle1" gutterBottom>
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
                        {sellernumber.toLocaleString()}
                      </Typography>
                    </Item>
                  </Grid>
                  <Grid item xs={3.5}>
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
                        {totalVolume.toLocaleString()}
                      </Typography>
                    </Item>
                  </Grid>
                </Grid>
              </Grid>
              <Paper sx={{ margin: 3, backgroundColor: "lightgrey",p:3 }}>
                <Typography variant="h5" textAlign="center">
                  กราฟเเสดงข้อมูล
                </Typography>
                <Grid container spacing={5} marginTop={-9}>
                  <Grid item xs={0.5}></Grid>
                  <Grid xs={2.6}>
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
                                  id: "จบทริป",
                                  color: "#52b202",
                                  value: tripCount,
                                },
                                {
                                  id: "อนุมัติ",
                                  color: "#2979ff",
                                  value: tripCount2,
                                },
                                {
                                  id: "รออนุมัติ",
                                  color: "#ffea00",
                                  value: tripCount1,
                                },
                              ],
                              type: "pie",
                              arcLabel: "label",
                            },
                          ]}
                        />
                      </Box>
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
                        <Typography
                          marginTop={-8}
                          color="#000000"
                          fontSize={12}
                        >
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
                              "จำนวนออเดอร์",
                              // "ปริมาณ",
                            ],
                            scaleType: "band",
                          },
                        ]}
                        series={[
                          {
                            data: [tripCount, sellernumber],
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
                  <Grid xs={2.6}>
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
                                  value: f_wait,
                                },
                                {
                                  id: "ยกเลิก",
                                  color: "#FF2929",
                                  value: f_cancel,
                                },
                                {
                                  id: "นำส่งสำเร็จ",
                                  color: "#52b202",
                                  value: sellernumber,
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
                
              </Paper>
              <Grid>.</Grid>
              {/* <Paper sx={{ margin: 2.7, backgroundColor: "lightgrey" }}>
                <Grid>
                  <Typography variant="h5" textAlign="center" padding={6}>
                    กราฟเเสดงจำนวนเที่ยว
                  </Typography>
                  <Item sx={{ margin: 5, marginTop: -2 }}>
                    <LineChart
                      width={1090}
                      height={500}
                      data={monthlyTrips}
                      margin={{ top: 50, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" fontSize={13} />
                      <YAxis fontSize={13} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="trips"
                        stroke="#131010"
                        activeDot={{ r: 10 }}
                        label={({ x, y, value }) => (
                          <text
                            x={x}
                            y={y - 10}
                            fill="black"
                            textAnchor="middle"
                            fontSize={15}
                          >
                            {value}
                          </text>
                        )}
                      />
                    </LineChart>
                  </Item>
                </Grid>
                <Grid>.</Grid>
              </Paper> */}
            </Box>
          </>
        )}
      </div>
    </Container>
  );
}
export default Dashboard3;
