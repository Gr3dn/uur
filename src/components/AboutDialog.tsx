import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

export const AboutDialog = ({ open, onClose }: AboutDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('about.title')}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography>{t('about.description')}</Typography>
          <Typography>{t('about.stack')}</Typography>
          <Typography>{t('about.observer')}</Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          {t('actions.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
