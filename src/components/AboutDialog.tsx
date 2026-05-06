import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
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
          <Typography>{t('about.purpose')}</Typography>
          <Typography>{t('about.stack')}</Typography>
          <Typography>{t('about.criteria')}</Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip size="small" variant="outlined" label={`${t('about.authorLabel')}: Hrechishkin`} />
            <Chip size="small" variant="outlined" label={`${t('about.personalNumberLabel')}: A23B0394P`} />
            <Chip size="small" variant="outlined" color="secondary" label={t('about.courseLabel')} />
          </Stack>
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
