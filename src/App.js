import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  Input,
  InputAdornment,
  InputLabel,
} from "@mui/material";


import React from "react";
import Dashboard from "./components/Dashboard";
import Dashboard3 from "./components/Dashboard3";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { getDatabase, ref, onValue } from "firebase/database";

function App() {
  const [show, setShow] = React.useState(0); // ใช้ตรวจสอบหน้าที่จะแสดง
  const [open, setOpen] = React.useState(false);
  const [id, setID] = React.useState(""); // เก็บ salecode
  const [currentSeller, setCurrentSeller] = React.useState([]); // เก็บข้อมูลเซลล์ที่ล็อกอิน

  const handleLogin = () => {
    const db = getDatabase();
    const sellerRef = ref(db, "/primarydata/seller");

    onValue(sellerRef, (snapshot) => {
      const datas = snapshot.val();
      const dataList = [];
      let found = false;

      for (let i in datas) {
        if (Number(datas[i].salecode) === Number(id)) {
          dataList.push(datas[i].salename); // เก็บข้อมูลเซลล์ที่ล็อกอิน
          setShow(2); // เปลี่ยนหน้าไปที่ Dashboard
          found = true;
          break;
        }
      }
      if (!found) {
        alert("รหัสเซลล์ไม่ถูกต้อง!");
      }

      setCurrentSeller(dataList);
    });
  };

  return (
    <Container maxWidth="xl">
      {show === 0 ? (
        <>
          <Grid container spacing={2} marginTop={20}>
            <Grid item xs={8}></Grid>
            <Grid
              item
              xs={4}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              {!open ? (
                <>
                  <FormControl variant="standard" sx={{width:150}}>
                    <InputLabel htmlFor="input-with-icon-adornment">
                      ล๊อกอินเข้าสู่ระบบเซลล์
                    </InputLabel>
                    <Input
                      id="input-with-icon-adornment"
                      startAdornment={
                        <InputAdornment position="start">
                          <AccountCircle />
                        </InputAdornment>
                      }
                      value={id}
                      onChange={(e) => setID(e.target.value)}
                    />
                  </FormControl>
                  <Button
                    sx={{}}
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={handleLogin}
                  >
                    ยืนยัน
                  </Button>
                  <Button
                    sx={{}}
                    variant="contained"
                    color="error"
                    size="large"
                    onClick={() => setOpen(true)}
                  >
                    ยกเลิก
                  </Button>
                </>
              ) : (
                <Button
                  sx={{}}
                  variant="contained"
                  color="success"
                  size="large"
                  onClick={() => setOpen(false)}
                >
                  สำหรับฝ่ายขาย
                </Button>
              )}
            </Grid>
          </Grid>
          <Dashboard/>
        </>
      ) : show === 1 ? (
        <>
           <Dashboard3 seller={currentSeller} />
        </>
      ) : (
        <>
          <Box marginRight={5} marginTop={10} textAlign="right">
            <Button
              variant="contained"
              color="error"
              size="large"
              onClick={() => setShow(0)}
            >
              กลับหน้า
            </Button>
          </Box>
          <Dashboard3 seller={currentSeller}/>
        </>
      )}
    </Container>
  );
}

export default App;
