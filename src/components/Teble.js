import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Box, Grid, Typography } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export default function Teble() {
  return (
    <Box paddingLeft={20} paddingRight={20}>
      <TableContainer component={Paper} sx={{ marginTop: -60 }}>
        <Table size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>ลำดับ</TableCell>
              <TableCell align="right">เซลล์</TableCell>
              <TableCell align="right">ลูกค้า</TableCell>
              <TableCell align="right">พนักงานขับรถเเละทะเบียน</TableCell>
              <TableCell align="right">สินค้า</TableCell>
              <TableCell align="right">ปริมาณความจุ</TableCell>
              <TableCell align="right">คลัง</TableCell>
              <TableCell align="right">วันที่จัดส่ง</TableCell>
              <TableCell align="right">เครดิต</TableCell>
              <TableCell align="right">วันครบกำหมดชำระ</TableCell>
              <TableCell align="right">วันที่ชำระ</TableCell>
              <TableCell align="right">จำนวน</TableCell>
              <TableCell align="right">ยอดคงเหลือ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody></TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h2" textAlign="center" sx={{ margin: -30 }}>
        เเสดงรายงานข้อมูลฝ่ายเซลล์
      </Typography>
      <Box>
        <Grid item sx={{ marginTop: 40, paddingRight: 190 }}>
          <Box>
            <Paper component="form">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  openTo="day"
                  views={["year", "month", "day"]}
                  value={dayjs(new Date()).locale("th")}
                  format="DD/MM/YYYY"
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                />
              </LocalizationProvider>
            </Paper>
          </Box>
        </Grid>

        <Grid sx={{ marginTop: -5, marginLeft: 30, paddingRight: 160 }}>
          <Box>
            <Paper component="form">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  openTo="day"
                  views={["year", "month", "day"]}
                  value={dayjs(new Date()).locale("th")}
                  format="DD/MM/YYYY"
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                />
              </LocalizationProvider>
            </Paper>
          </Box>
        </Grid>
      </Box>
    </Box>
  );
}
