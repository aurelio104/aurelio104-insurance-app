import { TextField } from '@mui/material';

const Input = ({ label, ...props }) => {
  return <TextField label={label} fullWidth {...props} />;
};

export default Input;
