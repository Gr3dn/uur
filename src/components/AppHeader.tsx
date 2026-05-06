import {
  AppBar,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { useTranslation } from 'react-i18next';
import type { MouseEvent } from 'react';
import type { AppMode, Language } from '../types/transport';

interface AppHeaderProps {
  mode: AppMode;
  clockLabel: string;
  language: Language;
  onLanguageChange: (language: Language) => void;
  onSaveState: () => void;
  onLoadState: () => void;
  onResetMock: () => void;
  onOpenAbout: () => void;
  onOpenRoutes: () => void;
}

export const AppHeader = ({
  mode,
  clockLabel,
  language,
  onLanguageChange,
  onSaveState,
  onLoadState,
  onResetMock,
  onOpenAbout,
  onOpenRoutes,
}: AppHeaderProps) => {
  const { t } = useTranslation();

  const handleLanguageChange = (_event: MouseEvent<HTMLElement>, nextLanguage: Language | null) => {
    if (!nextLanguage) {
      return;
    }
    onLanguageChange(nextLanguage);
  };

  return (
    <AppBar position="static" color="transparent" elevation={0} className="app-header">
      <Toolbar className="app-toolbar">
        <Box className="header-primary">
          <IconButton
            className="mobile-route-button"
            color="primary"
            aria-label={t('header.routes')}
            onClick={onOpenRoutes}
          >
            <MenuRoundedIcon />
          </IconButton>

          <Stack spacing={0.5} className="header-brand">
            <Typography variant="h5" component="h1">
              {t('app.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('app.subtitle')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('header.author')}
            </Typography>
          </Stack>
        </Box>

        <Box className="header-controls">
          <Chip
            icon={<AccessTimeIcon />}
            label={`${t('map.clock')}: ${clockLabel}`}
            color="primary"
            variant="outlined"
          />
          <Chip label={mode === 'planning' ? t('modes.planning') : t('modes.live')} color="secondary" />

          <ToggleButtonGroup
            size="small"
            exclusive
            value={language}
            onChange={handleLanguageChange}
            aria-label={t('header.language')}
          >
            <ToggleButton value="en">EN</ToggleButton>
            <ToggleButton value="cs">CS</ToggleButton>
          </ToggleButtonGroup>

          <Button startIcon={<UploadIcon />} onClick={onSaveState} variant="outlined" size="small">
            {t('header.save')}
          </Button>
          <Button startIcon={<DownloadIcon />} onClick={onLoadState} variant="outlined" size="small">
            {t('header.load')}
          </Button>
          <Button startIcon={<RestartAltIcon />} onClick={onResetMock} variant="outlined" size="small">
            {t('header.reset')}
          </Button>
          <Button startIcon={<InfoOutlinedIcon />} onClick={onOpenAbout} variant="contained" size="small">
            {t('header.about')}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
