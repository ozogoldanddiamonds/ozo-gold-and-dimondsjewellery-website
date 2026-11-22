import { Component } from '@angular/core';
import {

  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy
} from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent  implements AfterViewInit, OnDestroy {

  @ViewChild('statsSection') statsSection!: ElementRef;

  happyCustomers = 0;
  totalDesigns = 0;
  experience = 0;
  certified = 0;

  private observer!: IntersectionObserver;

ngAfterViewInit(): void {

  this.observer = new IntersectionObserver(
    (entries) => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          // Reset numbers to zero
          this.happyCustomers = 0;
          this.totalDesigns = 0;
          this.experience = 0;
          this.certified = 0;

          // Start animation every time section appears
          this.startCountAnimation();

        }

      });

    },
    {
      threshold: 0.3
    }
  );

  this.observer.observe(this.statsSection.nativeElement);

}

  startCountAnimation(): void {

  this.animateCount(10, 1500, (value) => {
    this.happyCustomers = value;
  });

  this.animateCount(500, 1800, (value) => {
    this.totalDesigns = value;
  });

  this.animateCount(15, 1500, (value) => {
    this.experience = value;
  });

  this.animateCount(100, 2000, (value) => {
    this.certified = value;
  });

}

  animateCount(
    target: number,
    duration: number,
    callback: (value: number) => void
  ): void {

    const startTime = performance.now();

    const update = (currentTime: number) => {

      const elapsed = currentTime - startTime;

      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out animation
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentValue = Math.floor(target * easeOut);

      callback(currentValue);

      if (progress < 1) {

        requestAnimationFrame(update);

      } else {

        callback(target);

      }

    };

    requestAnimationFrame(update);

  }

  ngOnDestroy(): void {

    this.observer?.disconnect();

  }

}


