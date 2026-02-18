import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit, Copy, Trash2, QrCode, GripVertical } from 'lucide-react';
import type { Passport } from '@/types/passport';

interface SortablePassportCardProps {
  passport: Passport;
  getCategoryIcon: (category: string) => string;
  onShowQR: (passport: Passport) => void;
  onDuplicate: (passport: Passport) => void;
  onDelete: (id: string) => void;
}

export function SortablePassportCard({
  passport,
  getCategoryIcon,
  onShowQR,
  onDuplicate,
  onDelete,
}: SortablePassportCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: passport.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`overflow-hidden ${isDragging ? 'ring-2 ring-primary shadow-lg' : ''}`}
    >
      {/* Mobile layout: stacked */}
      <div className="sm:hidden p-3">
        <div className="flex items-start gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground touch-none flex-shrink-0 mt-1"
            aria-label={t('dashboard.dragToReorder')}
          >
            <GripVertical className="h-5 w-5" />
          </button>
          
          {passport.image_url && (
            <div className="h-14 w-14 bg-muted overflow-hidden rounded flex-shrink-0">
              <img src={passport.image_url} alt={passport.name} className="w-full h-full object-cover" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <span>{getCategoryIcon(passport.category)}</span>
              <span>{t(`categories.${passport.category}`)}</span>
            </div>
            <h3 className="font-medium text-sm leading-tight">{passport.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {t('dashboard.updated')} {new Date(passport.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t">
          <TooltipProvider>
            {passport.public_slug && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => onShowQR(passport)}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('dashboard.showQr')}</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => navigate(`/passport/${passport.id}/edit`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('common.edit')}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => onDuplicate(passport)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('dashboard.duplicate')}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-destructive hover:text-destructive"
                  onClick={() => onDelete(passport.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('common.delete')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Desktop layout: horizontal */}
      <div className="hidden sm:flex items-center gap-4 p-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground touch-none flex-shrink-0"
          aria-label={t('dashboard.dragToReorder')}
        >
          <GripVertical className="h-5 w-5" />
        </button>
        
        {passport.image_url && (
          <div className="h-12 w-12 bg-muted overflow-hidden rounded flex-shrink-0">
            <img src={passport.image_url} alt={passport.name} className="w-full h-full object-cover" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span>{getCategoryIcon(passport.category)}</span>
            <span className="font-medium truncate">{passport.name}</span>
            <span className="text-sm text-muted-foreground">({t(`categories.${passport.category}`)})</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('dashboard.updated')} {new Date(passport.updated_at).toLocaleDateString()}
          </p>
        </div>
        
        <TooltipProvider>
          <div className="flex items-center gap-1 flex-shrink-0">
            {passport.public_slug && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onShowQR(passport)}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('dashboard.showQr')}</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => navigate(`/passport/${passport.id}/edit`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('common.edit')}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onDuplicate(passport)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('dashboard.duplicate')}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onDelete(passport.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('common.delete')}</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </Card>
  );
}
