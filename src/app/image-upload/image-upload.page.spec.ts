import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageUploadPage } from './image-upload.page';

describe('ImageUploadPage', () => {
  let component: ImageUploadPage;
  let fixture: ComponentFixture<ImageUploadPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ImageUploadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
