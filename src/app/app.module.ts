import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VenueComponent } from './venue/venue.component';
import { GalleryComponent } from './gallery/gallery.component';
import { ContactComponent } from './contact/contact.component';
import { EventsComponent } from './events/events.component';
import { FormationComponent } from './formation/formation.component';
import { HistoryComponent } from './history/history.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OfficeBearersComponent } from './office-bearers/office-bearers.component';
import { AboutComponent } from './about/about.component';
import { AdministrationComponent } from './administration/administration.component';
import { FinanceComponent } from './finance/finance.component';
import { GenealogyComponent } from './genealogy/genealogy.component';
import { D3OrgChartComponent } from './custom/d3-org-chart/d3-org-chart.component';
import { BlogComponent } from './blog/blog.component';
import { BlogListComponent } from './blog/blog-list/blog-list.component';
import { FamilyTreeComponent } from './family-tree/family-tree.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MaterialModule } from './material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EventDetailsComponent } from './event-details/event-details.component';

@NgModule({
  declarations: [
    AppComponent,
    VenueComponent,
    GalleryComponent,
    ContactComponent,
    EventsComponent,
    FormationComponent,
    HistoryComponent,
    FooterComponent,
    HeaderComponent,
    HomeComponent,
    OfficeBearersComponent,
    AboutComponent,
    AdministrationComponent,
    FinanceComponent,
    GenealogyComponent,
    D3OrgChartComponent,
    BlogComponent,
    BlogListComponent,
    FamilyTreeComponent,
    EventDetailsComponent
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    FormsModule,
    NgSelectModule,
    MaterialModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent,AppRoutingModule]
})
export class AppModule { }
