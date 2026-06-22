import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaUiComponent } from './pa-ui.component';

describe('PaUiComponent', () => {
  let component: PaUiComponent;
  let fixture: ComponentFixture<PaUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaUiComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
