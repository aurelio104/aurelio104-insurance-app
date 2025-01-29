import React from "react";
import { Card, CardContent, Typography, Avatar } from "@mui/material";

const UserInfoCard = ({ user }) => {
  return (
    <Card elevation={3}>
      <CardContent>
        <Avatar sx={{ width: 56, height: 56, mb: 2 }}>
          {user.name.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="h6">{user.name}</Typography>
        <Typography variant="body2" color="textSecondary">
          {user.email}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Role: {user.role}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default UserInfoCard;
