import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { usePassports } from '@/hooks/usePassports';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Plus, LogOut } from 'lucide-react';
import { categoryList } from '@/templates';
import { QRCodeDialog } from '@/components/QRCodeDialog';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { SortablePassportCard } from '@/components/SortablePassportCard';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Passport } from '@/types/passport';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedPassport, setSelectedPassport] = useState<{ name: string; slug: string; counterfeitProtection: boolean; wineIngredientsText?: string; wineEnergyText?: string } | null>(null);
  const [localPassports, setLocalPassports] = useState<Passport[]>([]);
  const { user, loading: authLoading, signOut } = useAuth();
  const { passports, isLoading, duplicatePassport, deletePassport, reorderPassports } = usePassports();
  const { config } = useSiteConfig();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Sync local state with server data
  useEffect(() => {
    if (passports.length > 0) {
      setLocalPassports(passports);
    }
  }, [passports]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalPassports((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Save the new order to the database
        reorderPassports.mutate(newOrder.map(p => p.id));
        
        return newOrder;
      });
    }
  };

  const handleDuplicate = async (passport: Passport) => {
    try {
      await duplicatePassport.mutateAsync(passport);
      toast({ title: t('dashboard.duplicated') });
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('dashboard.confirmDelete'))) return;
    try {
      await deletePassport.mutateAsync(id);
      toast({ title: t('dashboard.deleted') });
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    }
  };

  // Use short URL for QR codes if configured, otherwise use current origin
  const getPublicUrl = (slug: string) => {
    const baseUrl = config?.short_url?.trim() || window.location.origin;
    return `${baseUrl}/p/${slug}`;
  };

  const handleShowQR = (passport: Passport) => {
    if (!passport.public_slug) return;
    const categoryData = (passport.category_data as Record<string, unknown>) || {};
    const counterfeitProtection = categoryData.counterfeit_protection_enabled === true;

    let wineIngredientsText: string | undefined;
    let wineEnergyText: string | undefined;

    if (passport.category === 'wine') {
      // Show just the translated "Ingredients" label above QR (no full list)
      const ingredients = (categoryData.ingredients as Array<{ id: string }>) || [];
      if (ingredients.length > 0) {
        wineIngredientsText = t('wine.ingredients');
      }

      // Build energy text
      const energyKj = categoryData.energy_kj;
      const energyKcal = categoryData.energy_kcal;
      if (energyKj != null && energyKcal != null) {
        wineEnergyText = `E 100ml : ${energyKj} kJ / ${energyKcal} kcal`;
      }
    }

    setSelectedPassport({ name: passport.name, slug: passport.public_slug, counterfeitProtection, wineIngredientsText, wineEnergyText });
    setQrDialogOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    return categoryList.find(c => c.value === category)?.icon || '📦';
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Skeleton className="h-8 w-32" /></div>;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-sm">OL</span>
            </div>
            <h1 className="hidden md:block text-xl font-semibold whitespace-nowrap">Open Label <span className="text-primary font-bold">.eu</span></h1>
            <span className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-wider">beta</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <LanguageSwitcher />
            <span className="hidden sm:inline text-sm text-muted-foreground truncate max-w-[150px]">{user?.email}</span>
            <Button variant="ghost" size="icon" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{t('dashboard.title')}</h2>
          <Button asChild>
            <Link to="/passport/new"><Plus className="h-4 w-4 mr-2" /> {t('nav.createNew')}</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : localPassports.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">{t('dashboard.noPassports')}</p>
              <Button asChild><Link to="/passport/new"><Plus className="h-4 w-4 mr-2" /> {t('nav.createNew')}</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localPassports.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2">
                {localPassports.map(passport => (
                  <SortablePassportCard
                    key={passport.id}
                    passport={passport}
                    getCategoryIcon={getCategoryIcon}
                    onShowQR={handleShowQR}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <QRCodeDialog
          open={qrDialogOpen}
          onOpenChange={setQrDialogOpen}
          url={selectedPassport ? getPublicUrl(selectedPassport.slug) : ''}
          productName={selectedPassport?.name || ''}
          showSecuritySealOverlay={selectedPassport?.counterfeitProtection || false}
          wineIngredientsText={selectedPassport?.wineIngredientsText}
          wineEnergyText={selectedPassport?.wineEnergyText}
        />
      </main>
    </div>
  );
}
