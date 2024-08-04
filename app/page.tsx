"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import {
  Box,
  Button,
  Input,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
} from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [openRemove, setOpenRemove] = useState(false);
  const [itemName, setItemName] = useState<string>("");
  const [itemType, setItemType] = useState<string>("");
  const [itemQuantity, setItemQuantity] = useState<number | null>(null);
  const [search, setSearch] = useState<string>("");

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList: any[] = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
    console.log(inventoryList);
  };

  const removeItem = async (item: string, amount: number) => {
    const docRef = doc(firestore, "inventory", item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity }: any = docSnap.data();
      if (quantity <= amount) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - amount });
      }
    }

    await updateInventory();
  };

  const addItem = async (item: string, category: string, amount: number) => {
    const docRef = doc(firestore, "inventory", item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity }: any = docSnap.data();
      await setDoc(docRef, { quantity: amount + quantity, type: category });
    } else {
      await setDoc(docRef, { quantity: amount, type: category });
    }

    await updateInventory();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleRemoveOpen = () => setOpenRemove(true);
  const handleRemoveClose = () => setOpenRemove(false);

  useEffect(() => {
    updateInventory();
  }, []);

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent={"center"}
      alignItems={"center"}
      bgcolor={""}
      gap={2}
    >
      <Modal open={open} onClose={handleClose}>
        <Box
          component="div"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            bgcolor: "white",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Typography variant="h6" component="h2">
            Add item
          </Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              variant="outlined"
              fullWidth
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
            />
            <TextField
              variant="outlined"
              fullWidth
              type="number"
              value={itemQuantity ?? ""}
              onChange={(e) => setItemQuantity(Number(e.target.value))}
            />
            <Button
              variant="outlined"
              onClick={() => {
                if (itemName && itemType && itemQuantity != null) {
                  addItem(itemName, itemType, itemQuantity);
                  setItemName("");
                  setItemType("");
                  setItemQuantity(null);
                  handleClose();
                }
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal open={openRemove} onClose={handleRemoveClose}>
        <Box
          component="div"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "white",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Typography variant="h6" component="h2">
            Remove Item
          </Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              variant="outlined"
              fullWidth
              type="number"
              value={itemQuantity ?? ""}
              onChange={(e) => setItemQuantity(Number(e.target.value))}
            />
            <Button
              variant="outlined"
              onClick={() => {
                if (itemName && itemQuantity != null) {
                  removeItem(itemName, itemQuantity);
                  setItemName("");
                  setItemQuantity(null);
                  handleRemoveClose();
                }
              }}
            >
              Remove
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Typography variant="h1">Inventory Management</Typography>
      <Box
        display="flex"
        flexDirection={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
        width={"800px"}
        mb={2}
      >
        <Button variant="contained" onClick={handleOpen}>
          Add new Item
        </Button>

        <Button variant="contained" onClick={handleRemoveOpen}>
          Remove Item
        </Button>

        <TextField
          variant="outlined"
          placeholder="Search items"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      <Box border={"1px solid #333"} width="800px">
        <Box
          width={"100%"}
          height={"100px"}
          bgcolor="#ADD8EE"
          borderBottom={"solid 1px"}
          display="flex"
          alignItems={"center"}
          justifyContent={"center"}
          position="sticky"
          top={0}
          zIndex={1}
        >
          <Typography variant="h2" color="#333">
            Inventory List
          </Typography>
        </Box>

        <Box
          width={"100%"}
          borderBottom={"solid 1px"}
          display="flex"
          justifyContent={"space-evenly"}
          position="sticky"
          top={100}
          zIndex={1}
          bgcolor="#FFF"
        >
          <Typography variant="h6">Item</Typography>
          <Typography variant="h6">Quantity</Typography>
          <Typography variant="h6">Type</Typography>
        </Box>

        <Stack width="100%" height={"400px"} spacing={2} overflow={"auto"}>
          {filteredInventory.map((item, index) => (
            <Box
              key={index}
              width="100%"
              minHeight={"30px"}
              display={"flex"}
              flexDirection={"row"}
              alignItems={"center"}
              justifyContent={"space-evenly"}
              borderBottom={"solid 1px"}
              paddingY={2}
            >
              <Typography color="#333" textAlign={"center"}>
                {item.name}
              </Typography>
              <Typography color="#333" textAlign={"center"}>
                {item.quantity}
              </Typography>
              <Typography color="#333" textAlign={"center"}>
                {item.type}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
