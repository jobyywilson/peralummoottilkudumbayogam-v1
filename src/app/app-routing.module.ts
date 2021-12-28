import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { AdministrationComponent } from './administration/administration.component';
import { ContactComponent } from './contact/contact.component';
import { EventsComponent } from './events/events.component';
import { FamilyTreeComponent } from './family-tree/family-tree.component';
import { FinanceComponent } from './finance/finance.component';
import { GalleryComponent } from './gallery/gallery.component';
import { GenealogyComponent } from './genealogy/genealogy.component';
import { HistoryComponent } from './history/history.component';
import { HomeComponent } from './home/home.component';
import { OfficeBearersComponent } from './office-bearers/office-bearers.component';
import { VenueComponent } from './venue/venue.component';

const routes: Routes = [
  { path: '',   redirectTo: '/home', pathMatch: 'full' }, 
  { path: 'home', component: HomeComponent },
  { path: 'events', component: EventsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'genealogy', component: GenealogyComponent },
  { path: 'gallery', component: GalleryComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'venue', component: VenueComponent },
  { path: 'administration', component: AdministrationComponent },
  { path: 'finance', component: FinanceComponent },
  { path: 'office-bearers', component: OfficeBearersComponent },
  { path: 'family-tree', component: FamilyTreeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
