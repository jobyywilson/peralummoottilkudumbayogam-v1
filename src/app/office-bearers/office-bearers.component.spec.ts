import { Subject } from 'rxjs';
import { OfficeBearersComponent } from './office-bearers.component';

describe('OfficeBearersComponent', () => {
  let component: OfficeBearersComponent;
  let lists: Subject<any>;
  let contacts: Subject<any>;
  let crypto: any;

  const savedLists = () => ({
    '2024-2025': [{ title: 'Committee', members: [{ name: 'Previous member', officeBearerUserId: 'member-1' }] }],
    '2025-2026': [{ title: 'Committee', members: [{ name: 'Latest member', officeBearerUserId: 'member-1' }] }]
  });

  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 9, 11));
    lists = new Subject<any>();
    contacts = new Subject<any>();
    crypto = { decryptAndParse: jasmine.createSpy().and.returnValue([]) };
    component = new OfficeBearersComponent(
      { doGet: (url: string) => url.startsWith('assets/') ? lists : contacts } as any,
      { getUserPhotoByUserId: () => 'assets/img/user.png' } as any,
      crypto
    );
  });

  afterEach(() => jasmine.clock().uninstall());

  it('shows the latest saved list when the current financial year is unavailable', () => {
    expect(component.loading).toBeTrue();
    lists.next(savedLists());
    expect(component.loading).toBeFalse();
    expect(component.selectedYear).toBe('2025-2026');
    expect(component.years).toEqual(['2025-2026', '2024-2025']);
    expect(component.selectedOfficeList[0].officeMembers[0].name).toBe('Latest member');
  });

  it('keeps names visible when the contacts API fails', () => {
    lists.next(savedLists());
    contacts.error(new Error('API unavailable'));
    expect(component.selectedOfficeList[0].officeMembers.length).toBe(1);
    expect(component.loadError).toBeFalse();
  });

  it('keeps names visible when the encrypted response is invalid', () => {
    lists.next(savedLists());
    crypto.decryptAndParse.and.throwError('Invalid response');
    contacts.next({ data: 'invalid' });
    expect(component.selectedOfficeList[0].officeMembers.length).toBe(1);
  });

  it('uses contact details for the selected year when switching years', () => {
    lists.next(savedLists());
    crypto.decryptAndParse.and.returnValue([
      { year: '2025-2026', officeBearerUserId: 'member-1', user: { mobile: '111' } },
      { year: '2024-2025', officeBearerUserId: 'member-1', user: { mobile: '222' } }
    ]);
    contacts.next({ data: 'encrypted' });
    expect(component.selectedOfficeList[0].officeMembers[0].mobile).toBe('111');
    component.onYearchange({ value: '2024-2025' });
    expect(component.selectedOfficeList[0].officeMembers[0].name).toBe('Previous member');
    expect(component.selectedOfficeList[0].officeMembers[0].mobile).toBe('222');
  });

  it('handles missing user contact records', () => {
    expect(component.getMobileNumber('member-1', [{ officeBearerUserId: 'member-1', user: null }])).toBe('');
  });

  it('reports saved list loading failures', () => {
    lists.error(new Error('Unavailable'));
    expect(component.loading).toBeFalse();
    expect(component.loadError).toBeTrue();
  });

  it('handles an empty published list', () => {
    lists.next({});
    expect(component.loading).toBeFalse();
    expect(component.years).toEqual([]);
    expect(component.selectedOfficeList).toEqual([]);
  });

  it('prefers the current financial year when available', () => {
    lists.next({ ...savedLists(), '2026-2027': [] });
    expect(component.selectedYear).toBe('2026-2027');
  });
});
